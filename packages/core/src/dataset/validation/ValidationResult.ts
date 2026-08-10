import { ValidationIssue, ValidationSeverity } from "../interfaces/DatasetValidator.js";

/**
 * Common shape for validation diagnostics outcome.
 */
export interface IValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
  readonly issues: readonly ValidationIssue[];
}

/**
 * Concrete implementation of ValidationResult diagnostics outcome.
 * Immutable and strongly typed.
 */
export class ValidationResult implements IValidationResult {
  public readonly isValid: boolean;
  public readonly errors: readonly string[];
  public readonly warnings: readonly string[];
  public readonly issues: readonly ValidationIssue[];

  constructor(
    issues: readonly ValidationIssue[] = [],
    errors?: readonly string[],
    warnings?: readonly string[],
  ) {
    this.issues = Object.freeze([...issues]);

    const errorList: string[] = [];
    const warningList: string[] = [];

    // Extract errors and warnings directly from issues
    for (const issue of this.issues) {
      if (issue.severity === ValidationSeverity.ERROR) {
        errorList.push(issue.message);
      } else if (issue.severity === ValidationSeverity.WARNING) {
        warningList.push(issue.message);
      }
    }

    if (errors !== undefined) {
      if (this.issues.length === 0) {
        errorList.push(...errors);
      } else {
        const issueErrorCounts = new Map<string, number>();
        for (const issue of this.issues) {
          if (issue.severity === ValidationSeverity.ERROR) {
            issueErrorCounts.set(issue.message, (issueErrorCounts.get(issue.message) ?? 0) + 1);
          }
        }
        const passedErrorCounts = new Map<string, number>();
        for (const err of errors) {
          passedErrorCounts.set(err, (passedErrorCounts.get(err) ?? 0) + 1);
        }
        for (const [err, count] of passedErrorCounts.entries()) {
          const fromIssues = issueErrorCounts.get(err) ?? 0;
          const extra = count - fromIssues;
          for (let i = 0; i < extra; i++) {
            errorList.push(err);
          }
        }
      }
    }

    if (warnings !== undefined) {
      if (this.issues.length === 0) {
        warningList.push(...warnings);
      } else {
        const issueWarnCounts = new Map<string, number>();
        for (const issue of this.issues) {
          if (issue.severity === ValidationSeverity.WARNING) {
            issueWarnCounts.set(issue.message, (issueWarnCounts.get(issue.message) ?? 0) + 1);
          }
        }
        const passedWarnCounts = new Map<string, number>();
        for (const warn of warnings) {
          passedWarnCounts.set(warn, (passedWarnCounts.get(warn) ?? 0) + 1);
        }
        for (const [warn, count] of passedWarnCounts.entries()) {
          const fromIssues = issueWarnCounts.get(warn) ?? 0;
          const extra = count - fromIssues;
          for (let i = 0; i < extra; i++) {
            warningList.push(warn);
          }
        }
      }
    }

    this.errors = Object.freeze(errorList);
    this.warnings = Object.freeze(warningList);
    this.isValid =
      this.errors.length === 0 && !this.issues.some((i) => i.severity === ValidationSeverity.ERROR);
  }

  /**
   * Returns true if there are any error-level validation issues.
   */
  public hasErrors(): boolean {
    return this.errors.length > 0 || !this.isValid;
  }

  /**
   * Returns true if there are any warning-level validation issues.
   */
  public hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * Filters issues by specific severity.
   */
  public getIssuesBySeverity(severity: ValidationSeverity): readonly ValidationIssue[] {
    return this.issues.filter((issue) => issue.severity === severity);
  }

  /**
   * Filters issues by diagnostic error code.
   */
  public getIssuesByCode(code: string): readonly ValidationIssue[] {
    return this.issues.filter((issue) => issue.code === code);
  }

  /**
   * Merges this result with another ValidationResult, returning a new immutable ValidationResult.
   */
  public merge(other: IValidationResult): ValidationResult {
    return ValidationResult.combine(this, other);
  }

  /**
   * Creates a successful ValidationResult with optional warnings or info issues.
   */
  public static success(
    warnings: readonly string[] = [],
    additionalIssues: readonly ValidationIssue[] = [],
  ): ValidationResult {
    const issues: ValidationIssue[] = [...additionalIssues];
    for (const warning of warnings) {
      if (!issues.some((i) => i.message === warning && i.severity === ValidationSeverity.WARNING)) {
        issues.push({
          code: "VALIDATION_WARNING",
          message: warning,
          severity: ValidationSeverity.WARNING,
        });
      }
    }
    return new ValidationResult(issues, [], warnings);
  }

  /**
   * Creates a failed ValidationResult from issues or error messages.
   * Guarantees isValid === false under all circumstances.
   */
  public static failure(
    issuesOrErrors: readonly ValidationIssue[] | readonly string[],
    warnings: readonly string[] = [],
  ): ValidationResult {
    if (issuesOrErrors.length === 0) {
      throw new Error("ValidationResult.failure requires at least one error or issue");
    }

    const first = issuesOrErrors[0];
    if (typeof first === "string") {
      const errorStrings = issuesOrErrors as readonly string[];
      const issues: ValidationIssue[] = errorStrings.map((msg) => ({
        code: "VALIDATION_ERROR",
        message: msg,
        severity: ValidationSeverity.ERROR,
      }));
      return new ValidationResult(issues, errorStrings, warnings);
    }

    const rawIssues = issuesOrErrors as readonly ValidationIssue[];
    const hasErrorSeverity = rawIssues.some((i) => i.severity === ValidationSeverity.ERROR);
    let finalIssues: readonly ValidationIssue[] = rawIssues;

    // Escalate warning/info issues to ERROR if failure() was explicitly invoked without ERROR severity
    if (!hasErrorSeverity) {
      finalIssues = rawIssues.map((issue) => ({
        ...issue,
        severity: ValidationSeverity.ERROR,
      }));
    }

    return new ValidationResult(finalIssues, undefined, warnings);
  }

  /**
   * Constructs a ValidationResult directly from an array of ValidationIssue objects.
   */
  public static fromIssues(issues: readonly ValidationIssue[]): ValidationResult {
    return new ValidationResult(issues);
  }

  /**
   * Combines multiple ValidationResults into a single aggregate result.
   * Independently collects issues, errors, and warnings.
   */
  public static combine(
    ...results: readonly (IValidationResult | null | undefined)[]
  ): ValidationResult {
    const combinedIssues: ValidationIssue[] = [];
    const combinedErrors: string[] = [];
    const combinedWarnings: string[] = [];

    for (const res of results) {
      if (!res) continue;

      if (res.issues && res.issues.length > 0) {
        combinedIssues.push(...res.issues);
      }

      if (res.errors && res.errors.length > 0) {
        for (const err of res.errors) {
          combinedErrors.push(err);
        }
      }

      if (res.warnings && res.warnings.length > 0) {
        for (const warn of res.warnings) {
          combinedWarnings.push(warn);
        }
      }
    }

    return new ValidationResult(
      combinedIssues,
      combinedErrors.length > 0 ? combinedErrors : undefined,
      combinedWarnings.length > 0 ? combinedWarnings : undefined,
    );
  }

  /**
   * Creates an empty valid result.
   */
  public static empty(): ValidationResult {
    return new ValidationResult([], [], []);
  }
}

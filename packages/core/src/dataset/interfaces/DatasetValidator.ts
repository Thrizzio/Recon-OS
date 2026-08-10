import { Dataset } from "../entities/Dataset.js";
import { Document } from "../entities/Document.js";
import { ValidationResult } from "../validation/ValidationResult.js";

export { ValidationResult } from "../validation/ValidationResult.js";
export type { IValidationResult } from "../validation/ValidationResult.js";

/**
 * Diagnostic severity levels for validation issues.
 */
export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Detailed diagnostic descriptor for a single validation issue.
 */
export interface ValidationIssue {
  /** Machine-readable error code */
  readonly code: string;
  /** Human-readable explanation */
  readonly message: string;
  /** Diagnostic severity */
  readonly severity: ValidationSeverity;
  /** Optional field or property path where the issue occurred */
  readonly field?: string;
  /** Optional associated document identifier */
  readonly documentId?: string;
  /** Optional line or character offset if applicable */
  readonly line?: number;
  /** Optional structured diagnostic context */
  readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Contextual data provided to dataset validators during validation execution.
 */
export interface DatasetValidationContext {
  /** Optional candidate documents associated with the dataset */
  readonly documents?: readonly Document[] | Iterable<Document>;
  /** Optional custom schema or metadata requirements */
  readonly requiredMetadataKeys?: readonly string[];
  /** Additional domain-specific context parameters */
  readonly [key: string]: unknown;
}

/**
 * Interface for validating datasets against domain and structural invariants.
 */
export interface DatasetValidator<
  TContext extends DatasetValidationContext = DatasetValidationContext,
> {
  /** Unique name or identifier of the validator */
  readonly name: string;
  /**
   * Validates a dataset instance and optional context.
   * @param dataset - The dataset to validate
   * @param context - Optional validation context including documents and metadata rules
   * @returns A promise or direct instance of ValidationResult
   */
  validate(dataset: Dataset, context?: TContext): Promise<ValidationResult> | ValidationResult;
}

/**
 * Extensible validation rule signature for domain-specific checks.
 */
export interface ValidationRule<TTarget = Dataset, TContext = DatasetValidationContext> {
  /** Unique rule name */
  readonly name: string;
  /**
   * Evaluates the rule against the target and context.
   * @param target - The target entity to evaluate
   * @param context - Optional contextual data
   * @returns Diagnostic outcome, issues, or null/undefined if passed
   */
  validate(
    target: TTarget,
    context?: TContext,
  ):
    | Promise<ValidationResult | readonly ValidationIssue[] | ValidationIssue | null | undefined>
    | ValidationResult
    | readonly ValidationIssue[]
    | ValidationIssue
    | null
    | undefined;
}

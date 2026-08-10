import { Dataset } from "../entities/Dataset.js";
import {
  DatasetValidator,
  DatasetValidationContext,
  ValidationResult as IValidationResult,
  ValidationRule,
  ValidationIssue,
} from "../interfaces/DatasetValidator.js";
import { ValidationResult } from "./ValidationResult.js";
import { DuplicateDocumentValidator } from "./DuplicateDocumentValidator.js";
import { ChecksumValidator, ChecksumValidatorOptions } from "./ChecksumValidator.js";
import { SchemaComplianceValidator, SchemaComplianceOptions } from "./SchemaComplianceValidator.js";

/**
 * Execution configuration for composite validation pipeline.
 */
export interface CompositeValidationOptions {
  /** If true, stops validation execution immediately on first error encounter (default: false) */
  readonly stopOnFirstError?: boolean;
}

/**
 * Composite validator that aggregates multiple DatasetValidator instances and custom rules.
 * Provides extensible hooks for user-defined validation routines and deterministic execution.
 */
export class CompositeDatasetValidator implements DatasetValidator {
  public readonly name: string;
  private readonly validators: DatasetValidator[] = [];
  private readonly options: CompositeValidationOptions;

  constructor(
    name: string = "CompositeDatasetValidator",
    validators: readonly DatasetValidator[] = [],
    options: CompositeValidationOptions = {},
  ) {
    this.name = name;
    this.validators = [...validators];
    this.options = {
      stopOnFirstError: options.stopOnFirstError ?? false,
    };
  }

  /**
   * Registers an additional DatasetValidator into the pipeline.
   */
  public addValidator(validator: DatasetValidator): this {
    this.validators.push(validator);
    return this;
  }

  /**
   * Registers a domain-specific validation rule or functional hook into the pipeline.
   */
  public addRule(
    ruleOrName: ValidationRule | string,
    ruleFn?: (
      dataset: Dataset,
      context?: DatasetValidationContext,
    ) =>
      | Promise<IValidationResult | readonly ValidationIssue[] | ValidationIssue | null | undefined>
      | IValidationResult
      | readonly ValidationIssue[]
      | ValidationIssue
      | null
      | undefined,
  ): this {
    if (typeof ruleOrName === "object" && ruleOrName !== null) {
      const rule = ruleOrName;
      this.validators.push({
        name: rule.name,
        validate: async (dataset: Dataset, context?: DatasetValidationContext) => {
          const outcome = await rule.validate(dataset, context);
          return CompositeDatasetValidator.normalizeRuleOutcome(outcome);
        },
      });
    } else if (typeof ruleOrName === "string" && typeof ruleFn === "function") {
      const name = ruleOrName;
      this.validators.push({
        name,
        validate: async (dataset: Dataset, context?: DatasetValidationContext) => {
          const outcome = await ruleFn(dataset, context);
          return CompositeDatasetValidator.normalizeRuleOutcome(outcome);
        },
      });
    }
    return this;
  }

  /**
   * Returns a copy of registered validators in execution order.
   */
  public getValidators(): readonly DatasetValidator[] {
    return Object.freeze([...this.validators]);
  }

  /**
   * Executes all registered validators sequentially in O(N) aggregate time.
   * @param dataset - The dataset entity to validate
   * @param context - Optional validation context including documents and metadata rules
   */
  public async validate(
    dataset: Dataset,
    context?: DatasetValidationContext,
  ): Promise<ValidationResult> {
    const results: IValidationResult[] = [];

    for (const validator of this.validators) {
      const res = await validator.validate(dataset, context);
      results.push(res);

      if (this.options.stopOnFirstError && !res.isValid) {
        break;
      }
    }

    return ValidationResult.combine(...results);
  }

  /**
   * Factory method to create a pre-configured standard validation suite:
   * 1. SchemaComplianceValidator
   * 2. DuplicateDocumentValidator
   * 3. ChecksumValidator
   */
  public static createStandard(
    options: {
      schemaOptions?: SchemaComplianceOptions;
      checksumOptions?: ChecksumValidatorOptions;
      validationOptions?: CompositeValidationOptions;
    } = {},
  ): CompositeDatasetValidator {
    const pipeline = new CompositeDatasetValidator(
      "StandardDatasetValidationPipeline",
      [
        new SchemaComplianceValidator(options.schemaOptions),
        new DuplicateDocumentValidator(),
        new ChecksumValidator(options.checksumOptions),
      ],
      options.validationOptions,
    );

    return pipeline;
  }

  private static normalizeRuleOutcome(
    outcome: IValidationResult | readonly ValidationIssue[] | ValidationIssue | null | undefined,
  ): ValidationResult {
    if (!outcome) {
      return ValidationResult.success();
    }

    if (outcome instanceof ValidationResult) {
      return outcome;
    }

    if (Array.isArray(outcome)) {
      return ValidationResult.fromIssues(outcome);
    }

    if (typeof outcome === "object" && outcome !== null) {
      if ("isValid" in outcome && "issues" in outcome) {
        const res = outcome as unknown as IValidationResult;
        return new ValidationResult(res.issues, res.errors, res.warnings);
      }
      return ValidationResult.fromIssues([outcome as ValidationIssue]);
    }

    return ValidationResult.success();
  }
}

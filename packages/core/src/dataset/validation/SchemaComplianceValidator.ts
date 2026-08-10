import { Dataset } from "../entities/Dataset.js";
import {
  DatasetValidator,
  DatasetValidationContext,
  ValidationIssue,
  ValidationSeverity,
} from "../interfaces/DatasetValidator.js";
import { ValidationResult } from "./ValidationResult.js";

/**
 * Configuration options for SchemaComplianceValidator.
 */
export interface SchemaComplianceOptions {
  /** Required metadata keys that must exist on dataset */
  readonly requiredMetadataKeys?: readonly string[];
  /** Maximum allowable dataset description character length (default: 2000) */
  readonly maxDescriptionLength?: number;
  /** Maximum allowable number of tags (default: 50) */
  readonly maxTagsCount?: number;
  /** Custom schema constraint rules */
  readonly customRules?: readonly ((dataset: Dataset) => ValidationIssue | null | undefined)[];
}

/**
 * Validates structural schema compliance, required fields, and metadata contracts for Datasets.
 */
export class SchemaComplianceValidator implements DatasetValidator {
  public readonly name: string = "SchemaComplianceValidator";
  private readonly options: SchemaComplianceOptions;

  constructor(options: SchemaComplianceOptions = {}) {
    this.options = {
      requiredMetadataKeys: options.requiredMetadataKeys ?? [],
      maxDescriptionLength: options.maxDescriptionLength ?? 2000,
      maxTagsCount: options.maxTagsCount ?? 50,
      customRules: options.customRules ?? [],
    };
  }

  /**
   * Validates dataset instance against schema constraints.
   * @param dataset - The candidate dataset to validate
   * @param context - Optional context providing additional required metadata keys
   */
  public validate(dataset: Dataset, context?: DatasetValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (!dataset || typeof dataset.getId !== "function") {
      issues.push({
        code: "INVALID_DATASET_INSTANCE",
        message: "Target dataset is not a valid Dataset entity instance",
        severity: ValidationSeverity.ERROR,
      });
      return ValidationResult.fromIssues(issues);
    }

    // 1. Mandatory field checks
    const id = dataset.getId()?.getValue();
    if (!id || id.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset ID is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "id",
      });
    }

    const name = dataset.getName()?.getValue();
    if (!name || name.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset name is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "name",
      });
    }

    const version = dataset.getVersion()?.getValue();
    if (!version || version.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset version is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "version",
      });
    }

    const schemaVersion = dataset.getSchemaVersion()?.getValue();
    if (!schemaVersion || schemaVersion.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset schemaVersion is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "schemaVersion",
      });
    }

    const source = dataset.getSource();
    if (!source || !source.getType() || !source.getUri()) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset source specification requires non-empty type and URI",
        severity: ValidationSeverity.ERROR,
        field: "source",
      });
    }

    // 2. Description bounds check
    const description = dataset.getDescription()?.getValue();
    const maxDescLen = this.options.maxDescriptionLength ?? 2000;
    if (description && description.length > maxDescLen) {
      issues.push({
        code: "DESCRIPTION_LENGTH_EXCEEDED",
        message: `Dataset description length (${description.length}) exceeds maximum allowable length of ${maxDescLen}`,
        severity: ValidationSeverity.WARNING,
        field: "description",
        context: { actualLength: description.length, maxLength: maxDescLen },
      });
    }

    // 3. Tags count check
    const tags = dataset.getTags();
    const maxTags = this.options.maxTagsCount ?? 50;
    if (tags.size > maxTags) {
      issues.push({
        code: "TAG_COUNT_EXCEEDED",
        message: `Dataset tag count (${tags.size}) exceeds maximum allowable tags of ${maxTags}`,
        severity: ValidationSeverity.WARNING,
        field: "tags",
        context: { actualCount: tags.size, maxCount: maxTags },
      });
    }

    // 4. Required metadata validation
    const metadata = dataset.getMetadata();
    const requiredKeys = new Set<string>([
      ...(this.options.requiredMetadataKeys ?? []),
      ...(context?.requiredMetadataKeys ?? []),
    ]);

    for (const key of requiredKeys) {
      if (!metadata || !metadata.has(key)) {
        issues.push({
          code: "MISSING_REQUIRED_METADATA",
          message: `Required metadata key "${key}" is missing from dataset metadata`,
          severity: ValidationSeverity.ERROR,
          field: `metadata.${key}`,
          context: { missingKey: key },
        });
      }
    }

    // 5. Custom rule evaluation
    if (this.options.customRules) {
      for (const rule of this.options.customRules) {
        const issue = rule(dataset);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    if (issues.length > 0) {
      return ValidationResult.fromIssues(issues);
    }

    return ValidationResult.success();
  }
}

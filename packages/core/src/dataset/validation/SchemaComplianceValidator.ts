import { Dataset } from "../entities/Dataset.js";
import { DatasetTag } from "../value-objects/DatasetTag.js";
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

    // 1. Mandatory field checks with defensive access
    const id = typeof dataset.getId === "function" ? dataset.getId()?.getValue?.() : undefined;
    if (!id || id.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset ID is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "id",
      });
    }

    const name =
      typeof dataset.getName === "function" ? dataset.getName()?.getValue?.() : undefined;
    if (!name || name.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset name is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "name",
      });
    }

    const version =
      typeof dataset.getVersion === "function" ? dataset.getVersion()?.getValue?.() : undefined;
    if (!version || version.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset version is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "version",
      });
    }

    const schemaVersion =
      typeof dataset.getSchemaVersion === "function"
        ? dataset.getSchemaVersion()?.getValue?.()
        : undefined;
    if (!schemaVersion || schemaVersion.trim().length === 0) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset schemaVersion is missing or empty",
        severity: ValidationSeverity.ERROR,
        field: "schemaVersion",
      });
    }

    const source = typeof dataset.getSource === "function" ? dataset.getSource() : undefined;
    if (!source || !source.getType?.() || !source.getUri?.()) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Dataset source specification requires non-empty type and URI",
        severity: ValidationSeverity.ERROR,
        field: "source",
      });
    }

    // 2. Description bounds check
    const description =
      typeof dataset.getDescription === "function"
        ? dataset.getDescription()?.getValue?.()
        : undefined;
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

    // 3. Tags count check with string value deduplication and defensive null coalescing
    const rawTags =
      typeof dataset.getTags === "function"
        ? (dataset.getTags() ?? new Set<DatasetTag>())
        : new Set<DatasetTag>();
    const tagValues = new Set<string>();
    for (const t of rawTags) {
      if (t instanceof DatasetTag) {
        tagValues.add(t.getValue());
      } else if (
        typeof t === "object" &&
        t !== null &&
        "getValue" in t &&
        typeof (t as { getValue: unknown }).getValue === "function"
      ) {
        const val = (t as { getValue: () => unknown }).getValue();
        if (typeof val === "string") {
          tagValues.add(val);
        }
      } else if (typeof t === "string") {
        tagValues.add(t);
      }
    }
    const maxTags = this.options.maxTagsCount ?? 50;
    if (tagValues.size > maxTags) {
      issues.push({
        code: "TAG_COUNT_EXCEEDED",
        message: `Dataset tag count (${tagValues.size}) exceeds maximum allowable tags of ${maxTags}`,
        severity: ValidationSeverity.WARNING,
        field: "tags",
        context: { actualCount: tagValues.size, maxCount: maxTags },
      });
    }

    // 4. Required metadata validation
    const metadata = typeof dataset.getMetadata === "function" ? dataset.getMetadata() : undefined;
    const requiredKeys = new Set<string>([
      ...(this.options.requiredMetadataKeys ?? []),
      ...(context?.requiredMetadataKeys ?? []),
    ]);

    for (const key of requiredKeys) {
      if (!metadata || typeof metadata.has !== "function" || !metadata.has(key)) {
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

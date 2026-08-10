import { DomainError } from "./DomainError.js";
import { ValidationIssue, ValidationResult } from "../interfaces/DatasetValidator.js";

export class InvalidDatasetError extends DomainError {
  constructor(message: string) {
    super(message, "INVALID_DATASET");
  }
}

export class InvalidDocumentError extends DomainError {
  constructor(message: string) {
    super(message, "INVALID_DOCUMENT");
  }
}

export class DatasetValidationError extends DomainError {
  public readonly errors: readonly string[];
  public readonly issues: readonly ValidationIssue[];
  public readonly result?: ValidationResult;

  constructor(
    message: string,
    errors: readonly string[] = [],
    issues: readonly ValidationIssue[] = [],
    result?: ValidationResult,
  ) {
    super(message, "DATASET_VALIDATION_ERROR");
    this.errors = Object.freeze([...errors]);
    this.issues = Object.freeze([...issues]);
    this.result = result;
  }

  public static fromResult(
    result: ValidationResult,
    customMessage?: string,
  ): DatasetValidationError {
    const errorCount = result.errors.length;
    const message =
      customMessage ??
      `Dataset validation failed with ${errorCount} error${errorCount === 1 ? "" : "s"}: ${result.errors.join("; ")}`;
    return new DatasetValidationError(message, result.errors, result.issues, result);
  }
}

export class DuplicateDocumentError extends DomainError {
  constructor(documentId: string) {
    super(`Document with ID "${documentId}" already exists in dataset`, "DUPLICATE_DOCUMENT");
  }
}

export class UnsupportedSourceError extends DomainError {
  constructor(source: string) {
    super(`Unsupported dataset source: "${source}"`, "UNSUPPORTED_SOURCE");
  }
}

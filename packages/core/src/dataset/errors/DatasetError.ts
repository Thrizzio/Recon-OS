import { DomainError } from "./DomainError.js";

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

  constructor(message: string, errors: string[] = []) {
    super(message, "DATASET_VALIDATION_ERROR");
    this.errors = Object.freeze([...errors]);
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

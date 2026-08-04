import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * Unique identifier for a Document.
 * Immutable value object.
 */
export class DocumentId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      throw new InvalidDocumentError("DocumentId must be a non-empty string");
    }
    this.value = value.trim();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: DocumentId): boolean {
    return Boolean(other && this.value === other.value);
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): DocumentId {
    return new DocumentId(value);
  }
}

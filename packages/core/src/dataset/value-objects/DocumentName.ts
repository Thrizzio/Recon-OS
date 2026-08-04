import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * Name of a Document (e.g., file name).
 * Immutable value object.
 */
export class DocumentName {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new InvalidDocumentError("DocumentName must be a non-empty string");
    }
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: DocumentName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): DocumentName {
    return new DocumentName(value);
  }
}

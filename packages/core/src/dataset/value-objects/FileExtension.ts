import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * File extension (e.g., 'pdf', 'md').
 * Immutable value object.
 */
export class FileExtension {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new InvalidDocumentError("FileExtension must be a non-empty string");
    }
    // Remove leading dot if present and convert to lowercase
    const cleaned = value.replace(/^\./, "").toLowerCase();
    if (!/^[a-z0-9]+$/.test(cleaned)) {
      throw new InvalidDocumentError("FileExtension must contain only alphanumeric characters");
    }
    this.value = cleaned;
  }

  public getValue(): string {
    return this.value;
  }

  public withDot(): string {
    return `.${this.value}`;
  }

  public equals(other: FileExtension): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): FileExtension {
    return new FileExtension(value);
  }
}

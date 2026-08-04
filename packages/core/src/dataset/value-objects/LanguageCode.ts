import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * Language code (e.g., 'en', 'es', 'fr').
 * Immutable value object.
 */
export class LanguageCode {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new InvalidDocumentError("LanguageCode must be a non-empty string");
    }
    // Expecting ISO 639-1 two-letter code, but we'll accept any non-empty string for flexibility
    this.value = value.toLowerCase().trim();
    if (!this.value.match(/^[a-z]{2,3}(-[a-zA-Z]{4})?(-[a-zA-Z]{2})?$/)) {
      // Warning: not a standard language code, but we'll allow it for now.
      // In a stricter implementation, we might throw an error.
      // For now, we'll just log a warning or ignore.
      // We'll not throw to avoid breaking existing uses.
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: LanguageCode): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): LanguageCode {
    return new LanguageCode(value);
  }
}

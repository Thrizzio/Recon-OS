import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Uniform Resource Identifier (URI).
 * Immutable value object.
 */
export class URI {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      throw new InvalidDatasetError("URI must be a non-empty string");
    }
    const trimmed = value.trim();
    if (/\s/.test(trimmed)) {
      throw new InvalidDatasetError(`URI "${trimmed}" cannot contain whitespace`);
    }
    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: URI): boolean {
    return Boolean(other && this.value === other.value);
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): URI {
    return new URI(value);
  }
}

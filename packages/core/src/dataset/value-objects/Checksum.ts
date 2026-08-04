import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * Cryptographic checksum (e.g., SHA-256) of content.
 * Immutable value object.
 */
export class Checksum {
  private readonly value: string;
  private readonly algorithm: string;

  constructor(value: string, algorithm: string = "SHA-256") {
    if (!value || typeof value !== "string") {
      throw new InvalidDocumentError("Checksum must be a non-empty string");
    }
    // Optionally validate the format (hex digits) based on algorithm
    this.value = value;
    this.algorithm = algorithm;
  }

  public getValue(): string {
    return this.value;
  }

  public getAlgorithm(): string {
    return this.algorithm;
  }

  public equals(other: Checksum): boolean {
    return this.algorithm === other.algorithm && this.value === other.value;
  }

  public toString(): string {
    return `${this.algorithm}:${this.value}`;
  }

  public static from(value: string, algorithm: string = "SHA-256"): Checksum {
    return new Checksum(value, algorithm);
  }
}

import { InvalidDocumentError } from "../errors/DatasetError.js";

/**
 * Fingerprint of a Document, typically a hash of its content.
 * Immutable value object.
 */
export class DocumentFingerprint {
  private readonly checksum: string; // e.g., SHA-256 hex digest
  private readonly algorithm: string; // e.g., 'SHA-256'

  constructor(checksum: string, algorithm: string = "SHA-256") {
    if (!checksum || typeof checksum !== "string") {
      throw new InvalidDocumentError("DocumentFingerprint checksum must be a non-empty string");
    }
    if (!algorithm || typeof algorithm !== "string") {
      throw new InvalidDocumentError("DocumentFingerprint algorithm must be a non-empty string");
    }
    this.checksum = checksum.toLowerCase();
    this.algorithm = algorithm.toUpperCase();
  }

  public getChecksum(): string {
    return this.checksum;
  }

  public getAlgorithm(): string {
    return this.algorithm;
  }

  public equals(other: DocumentFingerprint): boolean {
    return this.checksum === other.checksum && this.algorithm === other.algorithm;
  }

  public toString(): string {
    return `${this.algorithm}:${this.checksum}`;
  }

  public static from(checksum: string, algorithm: string = "SHA-256"): DocumentFingerprint {
    return new DocumentFingerprint(checksum, algorithm);
  }
}

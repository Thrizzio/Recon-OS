import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Version identifier (e.g., '1.0.0', 'v1.4.2').
 * Immutable value object protecting version formatting and equality invariants.
 */
export class Version {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      throw new InvalidDatasetError("Version must be a non-empty string");
    }
    const trimmed = value.trim();
    if (!/^[vV]?\d+(\.\d+)*(-[a-zA-Z0-9.]+)?$/.test(trimmed)) {
      throw new InvalidDatasetError(`Invalid version format: "${trimmed}"`);
    }
    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Version): boolean {
    return Boolean(other && this.value === other.value);
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): Version {
    return new Version(value);
  }

  public static initial(): Version {
    return new Version("1.0.0");
  }
}

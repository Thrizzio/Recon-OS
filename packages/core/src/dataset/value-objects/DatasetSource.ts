import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Source of a dataset (e.g., file path, URL, S3 bucket).
 * Immutable value object.
 */
export class DatasetSource {
  private readonly type: string; // e.g., 'file', 'http', 's3', 'git'
  private readonly uri: string; // URI or path identifier
  private readonly config: Record<string, unknown>; // optional configuration

  constructor(type: string, uri: string, config: Record<string, unknown> = {}) {
    if (!type || typeof type !== "string") {
      throw new InvalidDatasetError("DatasetSource type must be a non-empty string");
    }
    if (!uri || typeof uri !== "string") {
      throw new InvalidDatasetError("DatasetSource uri must be a non-empty string");
    }
    this.type = type.toLowerCase().trim();
    this.uri = uri.trim();
    this.config = { ...config }; // shallow copy
  }

  public getType(): string {
    return this.type;
  }

  public getUri(): string {
    return this.uri;
  }

  public getConfig(): Record<string, unknown> {
    return { ...this.config };
  }

  public equals(other: DatasetSource): boolean {
    return (
      this.type === other.type &&
      this.uri === other.uri &&
      JSON.stringify(this.config) === JSON.stringify(other.config)
    );
  }

  public toString(): string {
    return `${this.type}:${this.uri}`;
  }

  public static from(
    type: string,
    uri: string,
    config: Record<string, unknown> = {},
  ): DatasetSource {
    return new DatasetSource(type, uri, config);
  }
}

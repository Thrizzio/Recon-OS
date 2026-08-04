import { Version } from "../value-objects/Version.js";
import { Timestamp } from "../value-objects/Timestamp.js";
import { InvalidDatasetError } from "../errors/DatasetError.js";

export interface DatasetVersionProps {
  version: Version;
  description?: string | null;
  createdAt?: Timestamp;
}

/**
 * DatasetVersion represents a specific version point of a Dataset.
 * Entity: possesses version identity and creation timestamp.
 */
export class DatasetVersion {
  private readonly version: Version;
  private readonly description: string | null;
  private readonly createdAt: Timestamp;

  constructor(props: DatasetVersionProps) {
    if (!props || !props.version) {
      throw new InvalidDatasetError("DatasetVersion requires a valid Version");
    }
    this.version = props.version;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt ?? new Timestamp(new Date());
  }

  public getVersion(): Version {
    return this.version;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  public equals(other: DatasetVersion): boolean {
    return Boolean(other && this.version.equals(other.version));
  }

  public toString(): string {
    return `DatasetVersion(v${this.version.getValue()})`;
  }

  public static create(version: Version, description: string | null = null): DatasetVersion {
    return new DatasetVersion({ version, description });
  }
}

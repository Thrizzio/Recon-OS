import { DatasetId } from "../value-objects/DatasetId.js";
import { DatasetName } from "../value-objects/DatasetName.js";
import { DatasetDescription } from "../value-objects/DatasetDescription.js";
import { Version } from "../value-objects/Version.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { DatasetStatus } from "../enums/DatasetStatus.js";
import { DatasetTag } from "../value-objects/DatasetTag.js";
import { DatasetStatistics } from "../value-objects/DatasetStatistics.js";
import { Timestamp } from "../value-objects/Timestamp.js";
import { InvalidDatasetError } from "../errors/DatasetError.js";

export interface DatasetProps {
  id: DatasetId;
  name: DatasetName;
  version: Version;
  source: DatasetSource;
  status?: DatasetStatus;
  description?: DatasetDescription | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  tags?: Set<DatasetTag>;
  statistics?: DatasetStatistics;
}

/**
 * Dataset represents a versioned collection of documents with metadata.
 * Aggregate Root: controls state transitions, invariants, and version identity.
 */
export class Dataset {
  private readonly id: DatasetId;
  private readonly name: DatasetName;
  private readonly description: DatasetDescription | null;
  private readonly version: Version;
  private readonly source: DatasetSource;
  private readonly status: DatasetStatus;
  private readonly createdAt: Timestamp;
  private readonly updatedAt: Timestamp;
  private readonly tags: Set<DatasetTag>;
  private readonly statistics: DatasetStatistics;

  constructor(props: DatasetProps) {
    if (!props || !props.id || !props.name || !props.version || !props.source) {
      throw new InvalidDatasetError("Dataset requires id, name, version, and source");
    }
    this.id = props.id;
    this.name = props.name;
    this.version = props.version;
    this.source = props.source;
    this.status = props.status ?? DatasetStatus.DRAFT;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt ?? new Timestamp(new Date());
    this.updatedAt = props.updatedAt ?? new Timestamp(new Date());
    this.tags = new Set(props.tags ?? []);
    this.statistics = props.statistics ?? new DatasetStatistics();
  }

  // Getters
  public getId(): DatasetId {
    return this.id;
  }

  public getName(): DatasetName {
    return this.name;
  }

  public getDescription(): DatasetDescription | null {
    return this.description;
  }

  public getVersion(): Version {
    return this.version;
  }

  public getSource(): DatasetSource {
    return this.source;
  }

  public getStatus(): DatasetStatus {
    return this.status;
  }

  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  public getUpdatedAt(): Timestamp {
    return this.updatedAt;
  }

  public getTags(): ReadonlySet<DatasetTag> {
    return new Set(this.tags);
  }

  public getStatistics(): DatasetStatistics {
    return this.statistics;
  }

  // Safe Immutable State Modifiers (Props pattern prevents position bugs)
  public withName(name: DatasetName): Dataset {
    return new Dataset({
      ...this.toProps(),
      name,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withDescription(description: DatasetDescription | null): Dataset {
    return new Dataset({
      ...this.toProps(),
      description,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withVersion(version: Version): Dataset {
    return new Dataset({
      ...this.toProps(),
      version,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withSource(source: DatasetSource): Dataset {
    return new Dataset({
      ...this.toProps(),
      source,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withStatus(status: DatasetStatus): Dataset {
    return new Dataset({
      ...this.toProps(),
      status,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public addTag(tag: DatasetTag): Dataset {
    const newTags = new Set(this.tags);
    newTags.add(tag);
    return new Dataset({
      ...this.toProps(),
      tags: newTags,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public removeTag(tag: DatasetTag): Dataset {
    const newTags = new Set(this.tags);
    newTags.delete(tag);
    return new Dataset({
      ...this.toProps(),
      tags: newTags,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public updateStatistics(statistics: DatasetStatistics): Dataset {
    return new Dataset({
      ...this.toProps(),
      statistics,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public equals(other: Dataset): boolean {
    return Boolean(other && this.id.equals(other.id));
  }

  public toString(): string {
    return `Dataset(${this.id.getValue()}: ${this.name.getValue()} v${this.version.getValue()})`;
  }

  private toProps(): DatasetProps {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      source: this.source,
      status: this.status,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      statistics: this.statistics,
    };
  }
}

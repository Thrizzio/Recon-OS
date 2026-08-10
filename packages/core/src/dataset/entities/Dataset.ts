import { DatasetId } from "../value-objects/DatasetId.js";
import { DatasetName } from "../value-objects/DatasetName.js";
import { DatasetDescription } from "../value-objects/DatasetDescription.js";
import { Version } from "../value-objects/Version.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { DatasetStatus } from "../enums/DatasetStatus.js";
import { DatasetTag } from "../value-objects/DatasetTag.js";
import { DatasetStatistics } from "../value-objects/DatasetStatistics.js";
import { Timestamp } from "../value-objects/Timestamp.js";
import { URI } from "../value-objects/URI.js";
import { DocumentMetadata } from "../value-objects/DocumentMetadata.js";
import { DatasetSerializer, DatasetJSON } from "../serialization/DatasetSerializer.js";
import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Properties required to construct or mutate a Dataset entity.
 */
export interface DatasetProps {
  /** Unique dataset identifier */
  id: DatasetId;
  /** Human-readable dataset name */
  name: DatasetName;
  /** Dataset semver version */
  version: Version;
  /** Schema specification version (defaults to 1.0.0) */
  schemaVersion?: Version;
  /** Dataset source specification */
  source: DatasetSource;
  /** Storage path URI for underlying files */
  storagePath?: URI | null;
  /** Operational status of the dataset */
  status?: DatasetStatus;
  /** Optional dataset description */
  description?: DatasetDescription | null;
  /** Creation timestamp */
  createdAt?: Timestamp;
  /** Last updated timestamp */
  updatedAt?: Timestamp;
  /** Set of dataset tags */
  tags?: Set<DatasetTag>;
  /** Aggregated dataset statistics */
  statistics?: DatasetStatistics;
  /** Additional domain metadata */
  metadata?: DocumentMetadata;
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
  private readonly schemaVersion: Version;
  private readonly source: DatasetSource;
  private readonly storagePath: URI | null;
  private readonly status: DatasetStatus;
  private readonly createdAt: Timestamp;
  private readonly updatedAt: Timestamp;
  private readonly tags: Set<DatasetTag>;
  private readonly statistics: DatasetStatistics;
  private readonly metadata: DocumentMetadata;

  constructor(props: DatasetProps) {
    if (!props || !props.id || !props.name || !props.version || !props.source) {
      throw new InvalidDatasetError("Dataset requires id, name, version, and source");
    }
    this.id = props.id;
    this.name = props.name;
    this.version = props.version;
    this.schemaVersion = props.schemaVersion ?? Version.from("1.0.0");
    this.source = props.source;
    this.storagePath = props.storagePath ?? null;
    this.status = props.status ?? DatasetStatus.DRAFT;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt ?? new Timestamp(new Date());
    this.updatedAt = props.updatedAt ?? new Timestamp(new Date());
    this.tags = Dataset.deduplicateTags(props.tags ?? []);
    this.statistics = props.statistics ?? new DatasetStatistics();
    this.metadata = props.metadata ?? DocumentMetadata.empty();
  }

  /** Gets the unique dataset identifier */
  public getId(): DatasetId {
    return this.id;
  }

  /** Gets the dataset name */
  public getName(): DatasetName {
    return this.name;
  }

  /** Gets the optional dataset description */
  public getDescription(): DatasetDescription | null {
    return this.description;
  }

  /** Gets the dataset semver version */
  public getVersion(): Version {
    return this.version;
  }

  /** Gets the schema version of the dataset domain model */
  public getSchemaVersion(): Version {
    return this.schemaVersion;
  }

  /** Gets the dataset source configuration */
  public getSource(): DatasetSource {
    return this.source;
  }

  /** Gets the storage path URI if specified */
  public getStoragePath(): URI | null {
    return this.storagePath;
  }

  /** Gets the dataset lifecycle status */
  public getStatus(): DatasetStatus {
    return this.status;
  }

  /** Gets the creation timestamp */
  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  /** Gets the last updated timestamp */
  public getUpdatedAt(): Timestamp {
    return this.updatedAt;
  }

  /** Gets the set of tags attached to the dataset */
  public getTags(): ReadonlySet<DatasetTag> {
    return new Set(this.tags);
  }

  /** Gets aggregated dataset statistics */
  public getStatistics(): DatasetStatistics {
    return this.statistics;
  }

  /** Gets domain metadata */
  public getMetadata(): DocumentMetadata {
    return this.metadata;
  }

  // Safe Immutable State Modifiers (Props pattern prevents position bugs)

  /** Returns a new Dataset instance with updated name */
  public withName(name: DatasetName): Dataset {
    return new Dataset({
      ...this.toProps(),
      name,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated description */
  public withDescription(description: DatasetDescription | null): Dataset {
    return new Dataset({
      ...this.toProps(),
      description,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated dataset version */
  public withVersion(version: Version): Dataset {
    return new Dataset({
      ...this.toProps(),
      version,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated schema version */
  public withSchemaVersion(schemaVersion: Version): Dataset {
    return new Dataset({
      ...this.toProps(),
      schemaVersion,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated source */
  public withSource(source: DatasetSource): Dataset {
    return new Dataset({
      ...this.toProps(),
      source,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated storage path */
  public withStoragePath(storagePath: URI | null): Dataset {
    return new Dataset({
      ...this.toProps(),
      storagePath,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated status */
  public withStatus(status: DatasetStatus): Dataset {
    return new Dataset({
      ...this.toProps(),
      status,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with an added tag (using value equality) */
  public addTag(tag: DatasetTag): Dataset {
    const tagMap = new Map<string, DatasetTag>();
    for (const t of this.tags) {
      tagMap.set(t.getValue(), t);
    }
    tagMap.set(tag.getValue(), tag);
    return new Dataset({
      ...this.toProps(),
      tags: new Set(tagMap.values()),
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with a removed tag (using value equality) */
  public removeTag(tag: DatasetTag): Dataset {
    const tagMap = new Map<string, DatasetTag>();
    for (const t of this.tags) {
      if (!t.equals(tag)) {
        tagMap.set(t.getValue(), t);
      }
    }
    return new Dataset({
      ...this.toProps(),
      tags: new Set(tagMap.values()),
      updatedAt: new Timestamp(new Date()),
    });
  }

  private static deduplicateTags(tags: Iterable<DatasetTag>): Set<DatasetTag> {
    const map = new Map<string, DatasetTag>();
    for (const tag of tags) {
      if (tag && typeof tag.getValue === "function") {
        map.set(tag.getValue(), tag);
      }
    }
    return new Set(map.values());
  }

  /** Returns a new Dataset instance with updated statistics */
  public updateStatistics(statistics: DatasetStatistics): Dataset {
    return new Dataset({
      ...this.toProps(),
      statistics,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Returns a new Dataset instance with updated metadata */
  public withMetadata(metadata: DocumentMetadata): Dataset {
    return new Dataset({
      ...this.toProps(),
      metadata,
      updatedAt: new Timestamp(new Date()),
    });
  }

  /** Checks equality against another Dataset entity by ID */
  public equals(other: Dataset): boolean {
    return Boolean(other && this.id.equals(other.id));
  }

  /** Serializes Dataset entity to plain JSON object */
  public toJSON(): DatasetJSON {
    return DatasetSerializer.serialize(this);
  }

  /** Reconstructs Dataset entity from plain JSON object */
  public static fromJSON(json: DatasetJSON): Dataset {
    return DatasetSerializer.deserialize(json);
  }

  /** Returns string representation of Dataset entity */
  public toString(): string {
    return `Dataset(${this.id.getValue()}: ${this.name.getValue()} v${this.version.getValue()})`;
  }

  private toProps(): DatasetProps {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      schemaVersion: this.schemaVersion,
      source: this.source,
      storagePath: this.storagePath,
      status: this.status,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      statistics: this.statistics,
      metadata: this.metadata,
    };
  }
}

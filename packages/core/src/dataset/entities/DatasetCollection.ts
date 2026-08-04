import { DatasetId } from "../value-objects/DatasetId.js";
import { Timestamp } from "../value-objects/Timestamp.js";
import { InvalidDatasetError } from "../errors/DatasetError.js";

export interface DatasetCollectionProps {
  id: string;
  name: string;
  description?: string | null;
  datasetIds?: Set<DatasetId>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * DatasetCollection represents a logical grouping of Datasets.
 * Entity: possesses identity and dataset membership set.
 */
export class DatasetCollection {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string | null;
  private readonly datasetIds: Set<DatasetId>;
  private readonly createdAt: Timestamp;
  private readonly updatedAt: Timestamp;

  constructor(props: DatasetCollectionProps) {
    if (!props || !props.id || !props.name) {
      throw new InvalidDatasetError("DatasetCollection requires id and name");
    }
    this.id = props.id.trim();
    this.name = props.name.trim();
    this.description = props.description ?? null;
    this.datasetIds = new Set(props.datasetIds ?? []);
    this.createdAt = props.createdAt ?? new Timestamp(new Date());
    this.updatedAt = props.updatedAt ?? new Timestamp(new Date());
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getDatasetIds(): ReadonlySet<DatasetId> {
    return new Set(this.datasetIds);
  }

  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  public getUpdatedAt(): Timestamp {
    return this.updatedAt;
  }

  public addDatasetId(datasetId: DatasetId): DatasetCollection {
    const newSet = new Set(this.datasetIds);
    newSet.add(datasetId);
    return new DatasetCollection({
      ...this.toProps(),
      datasetIds: newSet,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public removeDatasetId(datasetId: DatasetId): DatasetCollection {
    const newSet = new Set(this.datasetIds);
    // Remove matching by ID
    for (const item of newSet) {
      if (item.equals(datasetId)) {
        newSet.delete(item);
      }
    }
    return new DatasetCollection({
      ...this.toProps(),
      datasetIds: newSet,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withName(name: string): DatasetCollection {
    return new DatasetCollection({
      ...this.toProps(),
      name,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withDescription(description: string | null): DatasetCollection {
    return new DatasetCollection({
      ...this.toProps(),
      description,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public equals(other: DatasetCollection): boolean {
    return Boolean(other && this.id === other.id);
  }

  public toString(): string {
    return `DatasetCollection(${this.id}: ${this.name})`;
  }

  private toProps(): DatasetCollectionProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      datasetIds: this.datasetIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

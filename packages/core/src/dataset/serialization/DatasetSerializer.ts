import { Dataset } from "../entities/Dataset.js";
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
import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Plain JSON-serializable representation of DatasetSource.
 */
export interface DatasetSourceJSON {
  /** Source type identifier */
  type: string;
  /** Source URI */
  uri: string;
}

/**
 * Plain JSON-serializable representation of DatasetStatistics.
 */
export interface DatasetStatisticsJSON {
  /** Document count */
  documentCount: number;
  /** Total size in bytes */
  totalSizeBytes: number;
  /** Average document size in bytes */
  avgDocumentSizeBytes: number;
}

/**
 * Plain JSON-serializable representation of a Dataset domain aggregate.
 */
export interface DatasetJSON {
  /** Unique dataset identifier */
  id: string;
  /** Human-readable dataset name */
  name: string;
  /** Dataset semver version */
  version: string;
  /** Dataset domain model schema version */
  schemaVersion: string;
  /** Source specification */
  source: DatasetSourceJSON;
  /** Storage path URI */
  storagePath?: string | null;
  /** Operational dataset status */
  status: string;
  /** Optional description */
  description?: string | null;
  /** ISO format creation timestamp */
  createdAt: string;
  /** ISO format last updated timestamp */
  updatedAt: string;
  /** List of tag strings */
  tags: string[];
  /** Key-value metadata record */
  metadata: Record<string, unknown>;
  /** Aggregated statistics object */
  statistics: DatasetStatisticsJSON;
}

/**
 * Serialization and deserialization helper for Dataset domain objects.
 * Handles conversion between domain aggregate entities and plain JSON DTOs.
 */
export class DatasetSerializer {
  /**
   * Serializes a Dataset aggregate root entity into a plain JSON object.
   * @param dataset Dataset entity instance
   */
  public static serialize(dataset: Dataset): DatasetJSON {
    if (!dataset || !(dataset instanceof Dataset)) {
      throw new InvalidDatasetError("Serialization requires a valid Dataset instance");
    }

    const metadataEntries = dataset.getMetadata().entries();
    const metadataRecord: Record<string, unknown> = {};
    for (const [key, value] of metadataEntries) {
      metadataRecord[key] = value;
    }

    const tagsArray = Array.from(dataset.getTags()).map((t) => t.getValue());

    return {
      id: dataset.getId().getValue(),
      name: dataset.getName().getValue(),
      version: dataset.getVersion().getValue(),
      schemaVersion: dataset.getSchemaVersion().getValue(),
      source: {
        type: dataset.getSource().getType(),
        uri: dataset.getSource().getUri(),
      },
      storagePath: dataset.getStoragePath() ? dataset.getStoragePath()!.getValue() : null,
      status: dataset.getStatus(),
      description: dataset.getDescription() ? dataset.getDescription()!.getValue() : null,
      createdAt: dataset.getCreatedAt().getValue(),
      updatedAt: dataset.getUpdatedAt().getValue(),
      tags: tagsArray,
      metadata: metadataRecord,
      statistics: {
        documentCount: dataset.getStatistics().getDocumentCount(),
        totalSizeBytes: dataset.getStatistics().getTotalSizeBytes(),
        avgDocumentSizeBytes: dataset.getStatistics().getAverageSizeBytes(),
      },
    };
  }

  /**
   * Deserializes a plain JSON object back into a validated Dataset entity.
   * @param json DatasetJSON DTO payload
   */
  public static deserialize(json: DatasetJSON): Dataset {
    if (!json || typeof json !== "object") {
      throw new InvalidDatasetError("Deserialization payload must be a non-null object");
    }

    if (!json.id || !json.name || !json.version || !json.source) {
      throw new InvalidDatasetError("Dataset JSON payload requires id, name, version, and source");
    }

    const id = DatasetId.from(json.id);
    const name = DatasetName.from(json.name);
    const version = Version.from(json.version);
    const schemaVersion = json.schemaVersion
      ? Version.from(json.schemaVersion)
      : Version.from("1.0.0");

    const source = DatasetSource.from(json.source.type, json.source.uri);
    const storagePath = json.storagePath ? URI.from(json.storagePath) : null;
    const status = (json.status as DatasetStatus) ?? DatasetStatus.DRAFT;
    const description = json.description ? DatasetDescription.from(json.description) : null;

    const createdAt = json.createdAt
      ? new Timestamp(new Date(json.createdAt))
      : new Timestamp(new Date());

    const updatedAt = json.updatedAt
      ? new Timestamp(new Date(json.updatedAt))
      : new Timestamp(new Date());

    const tags = new Set<DatasetTag>(
      (json.tags ?? []).map((tagStr) => DatasetTag.from(tagStr))
    );

    const metadata = DocumentMetadata.from(json.metadata ?? {});

    const stats = json.statistics
      ? DatasetStatistics.create(
          json.statistics.documentCount ?? 0,
          json.statistics.totalSizeBytes ?? 0,
          json.statistics.avgDocumentSizeBytes ?? 0
        )
      : new DatasetStatistics();

    return new Dataset({
      id,
      name,
      version,
      schemaVersion,
      source,
      storagePath,
      status,
      description,
      createdAt,
      updatedAt,
      tags,
      metadata,
      statistics: stats,
    });
  }
}

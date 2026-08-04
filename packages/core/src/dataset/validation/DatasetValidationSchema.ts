import { DatasetId } from "../value-objects/DatasetId.js";
import { DatasetName } from "../value-objects/DatasetName.js";
import { DatasetDescription } from "../value-objects/DatasetDescription.js";
import { Version } from "../value-objects/Version.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { DatasetStatus } from "../enums/DatasetStatus.js";
import { DatasetTag } from "../value-objects/DatasetTag.js";
import { DatasetProps } from "../entities/Dataset.js";
import { URI } from "../value-objects/URI.js";
import { DocumentMetadata } from "../value-objects/DocumentMetadata.js";
import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Raw input interface for dataset registration requests.
 */
export interface RegisterDatasetInput {
  /** Dataset ID string or DatasetId value object */
  id: string | DatasetId;
  /** Dataset name string or DatasetName value object */
  name: string | DatasetName;
  /** Dataset version string or Version value object */
  version: string | Version;
  /** Schema version string or Version value object */
  schemaVersion?: string | Version;
  /** Source object or DatasetSource value object */
  source: { type: string; uri: string } | DatasetSource;
  /** Optional storage path URI string or URI value object */
  storagePath?: string | URI | null;
  /** Optional dataset status */
  status?: DatasetStatus;
  /** Optional description string or DatasetDescription value object */
  description?: string | DatasetDescription | null;
  /** Optional metadata record or DocumentMetadata value object */
  metadata?: Record<string, unknown> | DocumentMetadata;
  /** Optional tags array or Set of DatasetTag */
  tags?: string[] | Set<DatasetTag>;
}

/**
 * Raw input interface for dataset update requests.
 */
export interface UpdateDatasetInput {
  /** Optional updated name */
  name?: string | DatasetName;
  /** Optional updated dataset version */
  version?: string | Version;
  /** Optional updated schema version */
  schemaVersion?: string | Version;
  /** Optional updated source */
  source?: { type: string; uri: string } | DatasetSource;
  /** Optional updated storage path URI */
  storagePath?: string | URI | null;
  /** Optional updated dataset status */
  status?: DatasetStatus;
  /** Optional updated description */
  description?: string | DatasetDescription | null;
  /** Optional updated metadata */
  metadata?: Record<string, unknown> | DocumentMetadata;
  /** Optional updated tags */
  tags?: string[] | Set<DatasetTag>;
}

/**
 * Validation schema for registering a new dataset entity.
 * Enforces domain invariants and converts raw inputs into domain value objects.
 */
export class DatasetRegistrationSchema {
  /**
   * Validates dataset registration input and returns typed DatasetProps.
   * @throws {InvalidDatasetError} if any validation rule fails.
   */
  public static validate(input: RegisterDatasetInput): DatasetProps {
    if (!input || typeof input !== "object") {
      throw new InvalidDatasetError("Dataset registration input must be a non-null object");
    }

    const id =
      input.id instanceof DatasetId ? input.id : DatasetId.from(input.id);

    const name =
      input.name instanceof DatasetName ? input.name : DatasetName.from(input.name);

    const version =
      input.version instanceof Version ? input.version : Version.from(input.version);

    const schemaVersion = input.schemaVersion
      ? input.schemaVersion instanceof Version
        ? input.schemaVersion
        : Version.from(input.schemaVersion)
      : Version.from("1.0.0");

    let source: DatasetSource;
    if (input.source instanceof DatasetSource) {
      source = input.source;
    } else if (input.source && typeof input.source === "object") {
      source = DatasetSource.from(input.source.type, input.source.uri);
    } else {
      throw new InvalidDatasetError("Dataset source must be provided with type and uri");
    }

    let storagePath: URI | null = null;
    if (input.storagePath) {
      storagePath =
        input.storagePath instanceof URI
          ? input.storagePath
          : URI.from(input.storagePath);
    }

    let description: DatasetDescription | null = null;
    if (input.description) {
      description =
        input.description instanceof DatasetDescription
          ? input.description
          : DatasetDescription.from(input.description);
    }

    let metadata: DocumentMetadata = DocumentMetadata.empty();
    if (input.metadata) {
      metadata =
        input.metadata instanceof DocumentMetadata
          ? input.metadata
          : DocumentMetadata.from(input.metadata);
    }

    const tags = new Set<DatasetTag>();
    if (input.tags) {
      if (Array.isArray(input.tags)) {
        for (const t of input.tags) {
          tags.add(typeof t === "string" ? DatasetTag.from(t) : t);
        }
      } else if (input.tags instanceof Set) {
        for (const t of input.tags) {
          tags.add(typeof t === "string" ? DatasetTag.from(t) : t);
        }
      }
    }

    let status: DatasetStatus = DatasetStatus.DRAFT;
    if (input.status !== undefined) {
      if (!Object.values(DatasetStatus).includes(input.status as DatasetStatus)) {
        throw new InvalidDatasetError(`Invalid dataset status: ${input.status}`);
      }
      status = input.status as DatasetStatus;
    }

    return {
      id,
      name,
      version,
      schemaVersion,
      source,
      storagePath,
      status,
      description,
      metadata,
      tags,
    };
  }
}

/**
 * Validation schema for dataset update requests.
 * Enforces domain invariants on partial update payloads.
 */
export class DatasetUpdateSchema {
  /**
   * Validates dataset update payload and returns validated partial props.
   * @throws {InvalidDatasetError} if payload is empty or invalid.
   */
  public static validate(input: UpdateDatasetInput): Partial<DatasetProps> {
    if (!input || typeof input !== "object") {
      throw new InvalidDatasetError("Dataset update input must be a non-null object");
    }

    const result: Partial<DatasetProps> = {};

    if (input.name !== undefined) {
      result.name =
        input.name instanceof DatasetName ? input.name : DatasetName.from(input.name);
    }

    if (input.version !== undefined) {
      result.version =
        input.version instanceof Version ? input.version : Version.from(input.version);
    }

    if (input.schemaVersion !== undefined) {
      result.schemaVersion =
        input.schemaVersion instanceof Version
          ? input.schemaVersion
          : Version.from(input.schemaVersion);
    }

    if (input.source !== undefined) {
      if (input.source instanceof DatasetSource) {
        result.source = input.source;
      } else if (input.source && typeof input.source === "object") {
        result.source = DatasetSource.from(input.source.type, input.source.uri);
      } else {
        throw new InvalidDatasetError("Dataset source update must provide valid type and uri");
      }
    }

    if (input.storagePath !== undefined) {
      result.storagePath =
        input.storagePath === null
          ? null
          : input.storagePath instanceof URI
            ? input.storagePath
            : URI.from(input.storagePath);
    }

    if (input.status !== undefined) {
      if (!Object.values(DatasetStatus).includes(input.status)) {
        throw new InvalidDatasetError(`Invalid dataset status: ${input.status}`);
      }
      result.status = input.status;
    }

    if (input.description !== undefined) {
      result.description =
        input.description === null
          ? null
          : input.description instanceof DatasetDescription
            ? input.description
            : DatasetDescription.from(input.description);
    }

    if (input.metadata !== undefined) {
      result.metadata =
        input.metadata instanceof DocumentMetadata
          ? input.metadata
          : DocumentMetadata.from(input.metadata);
    }

    if (input.tags !== undefined) {
      const tags = new Set<DatasetTag>();
      if (Array.isArray(input.tags)) {
        for (const t of input.tags) {
          tags.add(typeof t === "string" ? DatasetTag.from(t) : t);
        }
      } else if (input.tags instanceof Set) {
        for (const t of input.tags) {
          tags.add(typeof t === "string" ? DatasetTag.from(t) : t);
        }
      }
      result.tags = tags;
    }

    if (Object.keys(result).length === 0) {
      throw new InvalidDatasetError("Update payload must contain at least one field to update");
    }

    return result;
  }
}

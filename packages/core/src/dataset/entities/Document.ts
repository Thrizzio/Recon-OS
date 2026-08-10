import { DocumentId } from "../value-objects/DocumentId.js";
import { DatasetId } from "../value-objects/DatasetId.js";
import { DocumentName } from "../value-objects/DocumentName.js";
import { DocumentType } from "../enums/DocumentType.js";
import { LanguageCode } from "../value-objects/LanguageCode.js";
import { DocumentFingerprint } from "../value-objects/DocumentFingerprint.js";
import { DocumentMetadata } from "../value-objects/DocumentMetadata.js";
import { ProcessingState } from "../enums/ProcessingState.js";
import { Timestamp } from "../value-objects/Timestamp.js";
import { InvalidDocumentError } from "../errors/DatasetError.js";

export interface DocumentProps {
  id: DocumentId;
  datasetId: DatasetId;
  name: DocumentName;
  type: DocumentType;
  content: string;
  size?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  language?: LanguageCode | null;
  fingerprint?: DocumentFingerprint | null;
  metadata?: DocumentMetadata;
  processingState?: ProcessingState;
}

/**
 * Document represents a single retrievable document unit within a Dataset.
 * Entity: possesses identity (DocumentId) and complete content lifecycle.
 */
export class Document {
  private readonly id: DocumentId;
  private readonly datasetId: DatasetId;
  private readonly name: DocumentName;
  private readonly type: DocumentType;
  private readonly content: string;
  private readonly size: number;
  private readonly createdAt: Timestamp;
  private readonly updatedAt: Timestamp;
  private readonly language: LanguageCode | null;
  private readonly fingerprint: DocumentFingerprint | null;
  private readonly metadata: DocumentMetadata;
  private readonly processingState: ProcessingState;

  constructor(props: DocumentProps) {
    if (!props || !props.id || !props.datasetId || !props.name || !props.type) {
      throw new InvalidDocumentError("Document requires id, datasetId, name, and type");
    }
    if (typeof props.content !== "string") {
      throw new InvalidDocumentError("Document content must be a string");
    }

    this.id = props.id;
    this.datasetId = props.datasetId;
    this.name = props.name;
    this.type = props.type;
    this.content = props.content;
    this.size = props.size ?? Buffer.byteLength(props.content, "utf8");
    this.createdAt = props.createdAt ?? new Timestamp(new Date());
    this.updatedAt = props.updatedAt ?? new Timestamp(new Date());
    this.language = props.language ?? null;
    this.fingerprint = props.fingerprint ?? null;
    this.metadata = props.metadata ?? DocumentMetadata.empty();
    this.processingState = props.processingState ?? ProcessingState.PENDING;
  }

  // Getters
  public getId(): DocumentId {
    return this.id;
  }

  public getDatasetId(): DatasetId {
    return this.datasetId;
  }

  public getName(): DocumentName {
    return this.name;
  }

  public getType(): DocumentType {
    return this.type;
  }

  public getContent(): string {
    return this.content;
  }

  public getSize(): number {
    return this.size;
  }

  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  public getUpdatedAt(): Timestamp {
    return this.updatedAt;
  }

  public getLanguage(): LanguageCode | null {
    return this.language;
  }

  public getFingerprint(): DocumentFingerprint | null {
    return this.fingerprint;
  }

  public getMetadata(): DocumentMetadata {
    return this.metadata;
  }

  public getProcessingState(): ProcessingState {
    return this.processingState;
  }

  // Immutable State Modifiers
  public withContent(content: string): Document {
    return new Document({
      ...this.toProps(),
      content,
      size: Buffer.byteLength(content, "utf8"),
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withName(name: DocumentName): Document {
    return new Document({
      ...this.toProps(),
      name,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withType(type: DocumentType): Document {
    return new Document({
      ...this.toProps(),
      type,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withMetadata(metadata: DocumentMetadata): Document {
    return new Document({
      ...this.toProps(),
      metadata,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public withProcessingState(state: ProcessingState): Document {
    return new Document({
      ...this.toProps(),
      processingState: state,
      updatedAt: new Timestamp(new Date()),
    });
  }

  public isProcessed(): boolean {
    return this.processingState === ProcessingState.PROCESSED;
  }

  public isFailed(): boolean {
    return this.processingState === ProcessingState.FAILED;
  }

  public equals(other: Document): boolean {
    return Boolean(other && this.id.equals(other.id));
  }

  public toString(): string {
    return `Document(${this.id.getValue()}: ${this.name.getValue()})`;
  }

  private toProps(): DocumentProps {
    return {
      id: this.id,
      datasetId: this.datasetId,
      name: this.name,
      type: this.type,
      content: this.content,
      size: this.size,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      language: this.language,
      fingerprint: this.fingerprint,
      metadata: this.metadata,
      processingState: this.processingState,
    };
  }
}

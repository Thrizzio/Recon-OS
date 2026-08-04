import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Dataset,
  Document,
  DatasetVersion,
  DatasetCollection,
  DatasetId,
  DocumentId,
  DatasetName,
  DocumentName,
  DatasetDescription,
  Version,
  DatasetSource,
  DatasetStatus,
  DocumentType,
  ProcessingState,
  DatasetTag,
  DatasetStatistics,
  DocumentMetadata,
  URI,
  Checksum,
  InvalidDatasetError,
  InvalidDocumentError,
  DatasetRegistrationSchema,
  DatasetUpdateSchema,
} from "../dist/index.js";

test("DatasetId protects non-empty string invariant and equality", () => {
  const id1 = DatasetId.from("ds_123");
  const id2 = DatasetId.from("ds_123");
  const id3 = DatasetId.from("ds_456");

  assert.equal(id1.getValue(), "ds_123");
  assert.ok(id1.equals(id2));
  assert.equal(id1.equals(id3), false);
  assert.throws(() => new DatasetId(""), InvalidDatasetError);
});

test("DocumentId protects non-empty string invariant and equality", () => {
  const id1 = DocumentId.from("doc_123");
  const id2 = DocumentId.from("doc_123");

  assert.equal(id1.getValue(), "doc_123");
  assert.ok(id1.equals(id2));
  assert.throws(() => new DocumentId("   "), InvalidDocumentError);
});

test("Version protects SemVer formatting invariant", () => {
  const v1 = Version.from("1.0.0");
  const v2 = Version.from("v2.1.0-alpha.1");

  assert.equal(v1.getValue(), "1.0.0");
  assert.equal(v2.getValue(), "v2.1.0-alpha.1");
  assert.throws(() => new Version("invalid-version!!"), InvalidDatasetError);
});

test("URI protects non-empty string without whitespace", () => {
  const uri = URI.from("https://example.com/data.json");
  assert.equal(uri.getValue(), "https://example.com/data.json");
  assert.throws(() => new URI("https://example.com/data json"), InvalidDatasetError);
});

test("Checksum and DocumentMetadata value objects behave deterministically", () => {
  const checksum = Checksum.from("a1b2c3d4", "SHA-256");
  assert.equal(checksum.getValue(), "a1b2c3d4");
  assert.equal(checksum.getAlgorithm(), "SHA-256");

  const metadata = DocumentMetadata.empty().set("author", "Recon team");
  assert.equal(metadata.get<string>("author"), "Recon team");
  assert.ok(metadata.has("author"));
});

test("DatasetVersion and DatasetStatistics value objects maintain state", () => {
  const version = Version.from("1.2.0");
  const dsVersion = DatasetVersion.create(version, "Minor feature release");
  assert.equal(dsVersion.getVersion().getValue(), "1.2.0");
  assert.equal(dsVersion.getDescription(), "Minor feature release");

  const stats = DatasetStatistics.create(10, 2048, 204.8);
  assert.equal(stats.getDocumentCount(), 10);
  assert.equal(stats.getTotalSizeBytes(), 2048);
});

test("Document entity encapsulates content and state immutability", () => {
  const doc = new Document({
    id: DocumentId.from("doc_1"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("sample.txt"),
    type: DocumentType.TEXT,
    content: "Hello, Recon-OS RAG Platform!",
  });

  assert.equal(doc.getId().getValue(), "doc_1");
  assert.equal(doc.getContent(), "Hello, Recon-OS RAG Platform!");
  assert.equal(doc.getSize(), "Hello, Recon-OS RAG Platform!".length);
  assert.equal(doc.getProcessingState(), ProcessingState.PENDING);
  assert.equal(doc.isProcessed(), false);

  const updatedDoc = doc.withContent("Updated RAG Document Content");
  assert.equal(doc.getContent(), "Hello, Recon-OS RAG Platform!");
  assert.equal(updatedDoc.getContent(), "Updated RAG Document Content");
  assert.equal(updatedDoc.getId().getValue(), "doc_1");

  const processedDoc = updatedDoc.withProcessingState(ProcessingState.PROCESSED);
  assert.equal(processedDoc.isProcessed(), true);
});

test("Dataset aggregate maintains state safety and parameter ordering", () => {
  const dataset = new Dataset({
    id: DatasetId.from("ds_100"),
    name: DatasetName.from("Legal Corpus"),
    version: Version.from("1.0.0"),
    source: DatasetSource.from("file", "/path/to/legal.pdf"),
    description: DatasetDescription.from("Initial legal documents"),
    status: DatasetStatus.DRAFT,
  });

  assert.equal(dataset.getId().getValue(), "ds_100");
  assert.equal(dataset.getName().getValue(), "Legal Corpus");
  assert.equal(dataset.getVersion().getValue(), "1.0.0");
  assert.equal(dataset.getSource().getUri(), "/path/to/legal.pdf");
  assert.equal(dataset.getDescription()?.getValue(), "Initial legal documents");
  assert.equal(dataset.getStatus(), DatasetStatus.DRAFT);
  assert.equal(dataset.getSchemaVersion().getValue(), "1.0.0");
  assert.equal(dataset.getStoragePath(), null);

  // Test withName does NOT corrupt version, source, or description
  const renamedDataset = dataset.withName(DatasetName.from("Updated Legal Corpus"));
  assert.equal(renamedDataset.getName().getValue(), "Updated Legal Corpus");
  assert.equal(renamedDataset.getVersion().getValue(), "1.0.0");
  assert.equal(renamedDataset.getSource().getUri(), "/path/to/legal.pdf");
  assert.equal(renamedDataset.getDescription()?.getValue(), "Initial legal documents");

  // Test tag additions
  const tag = DatasetTag.from("legal");
  const taggedDataset = renamedDataset.addTag(tag);
  assert.equal(taggedDataset.getTags().size, 1);
});

test("Dataset entity handles schemaVersion, storagePath, and metadata immutability", () => {
  const meta = DocumentMetadata.empty().set("domain", "finance");
  const storage = URI.from("s3://recon-os-bucket/datasets/ds_200/");

  const dataset = new Dataset({
    id: DatasetId.from("ds_200"),
    name: DatasetName.from("Financial Q&A"),
    version: Version.from("2.0.0"),
    schemaVersion: Version.from("1.1.0"),
    source: DatasetSource.from("s3", "s3://recon-os-bucket/raw/"),
    storagePath: storage,
    metadata: meta,
    status: DatasetStatus.READY,
  });

  assert.equal(dataset.getSchemaVersion().getValue(), "1.1.0");
  assert.equal(dataset.getStoragePath()?.getValue(), "s3://recon-os-bucket/datasets/ds_200/");
  assert.equal(dataset.getMetadata().get<string>("domain"), "finance");

  // Test immutable updates
  const newSchema = Version.from("1.2.0");
  const updatedSchemaDs = dataset.withSchemaVersion(newSchema);
  assert.equal(dataset.getSchemaVersion().getValue(), "1.1.0");
  assert.equal(updatedSchemaDs.getSchemaVersion().getValue(), "1.2.0");

  const newStorage = URI.from("s3://recon-os-bucket/datasets/ds_200_v2/");
  const updatedStorageDs = dataset.withStoragePath(newStorage);
  assert.equal(dataset.getStoragePath()?.getValue(), "s3://recon-os-bucket/datasets/ds_200/");
  assert.equal(updatedStorageDs.getStoragePath()?.getValue(), "s3://recon-os-bucket/datasets/ds_200_v2/");

  const newMeta = meta.set("env", "production");
  const updatedMetaDs = dataset.withMetadata(newMeta);
  assert.equal(dataset.getMetadata().has("env"), false);
  assert.equal(updatedMetaDs.getMetadata().get<string>("env"), "production");
});

test("DatasetRegistrationSchema validates raw payloads and rejects invalid inputs", () => {
  const validProps = DatasetRegistrationSchema.validate({
    id: "ds_300",
    name: "Medical Abstracts",
    version: "1.0.0",
    schemaVersion: "1.0.0",
    source: { type: "file", uri: "/data/med.json" },
    storagePath: "file:///data/storage/med/",
    status: DatasetStatus.READY,
    description: "PubMed abstracts dataset",
    metadata: { topic: "medicine" },
    tags: ["pubmed", "medical"],
  });

  const dataset = new Dataset(validProps);
  assert.equal(dataset.getId().getValue(), "ds_300");
  assert.equal(dataset.getName().getValue(), "Medical Abstracts");
  assert.equal(dataset.getStatus(), DatasetStatus.READY);
  assert.equal(dataset.getTags().size, 2);

  // Invalid payload checks
  assert.throws(
    () => DatasetRegistrationSchema.validate({ id: "", name: "Test", version: "1.0.0", source: { type: "file", uri: "/test" } }),
    InvalidDatasetError
  );
  assert.throws(
    () => DatasetRegistrationSchema.validate({ id: "ds_1", name: "Test", version: "invalid_ver", source: { type: "file", uri: "/test" } }),
    InvalidDatasetError
  );
  assert.throws(
    () => DatasetRegistrationSchema.validate({ id: "ds_1", name: "Test", version: "1.0.0", source: null as unknown as { type: string; uri: string } }),
    InvalidDatasetError
  );
});

test("DatasetUpdateSchema validates update payloads and rejects empty/invalid payloads", () => {
  const updateProps = DatasetUpdateSchema.validate({
    name: "Updated Medical Abstracts",
    status: DatasetStatus.ARCHIVED,
    tags: ["updated"],
  });

  assert.equal(updateProps.name?.getValue(), "Updated Medical Abstracts");
  assert.equal(updateProps.status, DatasetStatus.ARCHIVED);

  // Empty update payload should throw
  assert.throws(() => DatasetUpdateSchema.validate({}), InvalidDatasetError);

  // Invalid status in update payload should throw
  assert.throws(
    () => DatasetUpdateSchema.validate({ status: "NON_EXISTENT" as unknown as DatasetStatus }),
    InvalidDatasetError
  );
});

test("DatasetSerializer handles round-trip serialization and deserialization cleanly", () => {
  const original = new Dataset({
    id: DatasetId.from("ds_400"),
    name: DatasetName.from("Benchmark Dataset"),
    version: Version.from("3.1.0"),
    schemaVersion: Version.from("1.0.0"),
    source: DatasetSource.from("api", "https://api.example.com/dataset"),
    storagePath: URI.from("https://storage.example.com/datasets/400"),
    status: DatasetStatus.READY,
    description: DatasetDescription.from("Comprehensive RAG evaluation set"),
    metadata: DocumentMetadata.empty().set("creator", "Recon-OS"),
    tags: new Set([DatasetTag.from("rag"), DatasetTag.from("eval")]),
    statistics: DatasetStatistics.create(100, 1048576, 10485.76),
  });

  const json = original.toJSON();
  assert.equal(json.id, "ds_400");
  assert.equal(json.name, "Benchmark Dataset");
  assert.equal(json.version, "3.1.0");
  assert.equal(json.schemaVersion, "1.0.0");
  assert.equal(json.source.type, "api");
  assert.equal(json.storagePath, "https://storage.example.com/datasets/400");
  assert.equal(json.tags.length, 2);
  assert.equal(json.metadata.creator, "Recon-OS");

  const deserialized = Dataset.fromJSON(json);
  assert.ok(original.equals(deserialized));
  assert.equal(deserialized.getName().getValue(), "Benchmark Dataset");
  assert.equal(deserialized.getVersion().getValue(), "3.1.0");
  assert.equal(deserialized.getStoragePath()?.getValue(), "https://storage.example.com/datasets/400");
  assert.equal(deserialized.getMetadata().get<string>("creator"), "Recon-OS");
  assert.equal(deserialized.getStatistics().getDocumentCount(), 100);
});

test("DatasetCollection aggregates dataset IDs cleanly", () => {
  const collection = new DatasetCollection({
    id: "col_1",
    name: "Finance Collection",
  });

  const dsId = DatasetId.from("ds_fin_1");
  const updatedCollection = collection.addDatasetId(dsId);

  assert.equal(updatedCollection.getDatasetIds().size, 1);
  assert.ok(updatedCollection.getDatasetIds().has(dsId));

  const removedCollection = updatedCollection.removeDatasetId(dsId);
  assert.equal(removedCollection.getDatasetIds().size, 0);
});


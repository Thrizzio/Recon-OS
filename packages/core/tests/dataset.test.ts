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

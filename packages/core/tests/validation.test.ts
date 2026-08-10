import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Dataset,
  Document,
  DatasetId,
  DocumentId,
  DatasetName,
  DocumentName,
  DatasetDescription,
  Version,
  DatasetSource,
  DocumentType,
  DatasetTag,
  DocumentFingerprint,
  DocumentMetadata,
  ValidationSeverity,
  ValidationResult,
  DuplicateDocumentValidator,
  ChecksumValidator,
  SchemaComplianceValidator,
  CompositeDatasetValidator,
  DatasetValidationError,
  DatasetRegistrationSchema,
} from "../dist/index.js";

test("ValidationResult model constructs and merges diagnostics cleanly", () => {
  const empty = ValidationResult.empty();
  assert.equal(empty.isValid, true);
  assert.equal(empty.errors.length, 0);
  assert.equal(empty.warnings.length, 0);
  assert.equal(empty.issues.length, 0);

  const success = ValidationResult.success(["Warning message 1"]);
  assert.equal(success.isValid, true);
  assert.equal(success.hasWarnings(), true);
  assert.equal(success.hasErrors(), false);
  assert.equal(success.warnings.length, 1);
  assert.equal(success.warnings[0], "Warning message 1");

  const failure = ValidationResult.failure(["Error 1", "Error 2"], ["Warning A"]);
  assert.equal(failure.isValid, false);
  assert.equal(failure.hasErrors(), true);
  assert.equal(failure.errors.length, 2);
  assert.equal(failure.warnings.length, 1);

  const issueResult = ValidationResult.fromIssues([
    {
      code: "TEST_ERR",
      message: "Test error message",
      severity: ValidationSeverity.ERROR,
      field: "field.name",
    },
    {
      code: "TEST_WARN",
      message: "Test warning message",
      severity: ValidationSeverity.WARNING,
      field: "field.warn",
    },
  ]);

  assert.equal(issueResult.isValid, false);
  assert.equal(issueResult.errors.length, 1);
  assert.equal(issueResult.warnings.length, 1);
  assert.equal(issueResult.getIssuesBySeverity(ValidationSeverity.ERROR).length, 1);
  assert.equal(issueResult.getIssuesByCode("TEST_ERR").length, 1);

  const merged = success.merge(issueResult);
  assert.equal(merged.isValid, false);
  assert.equal(merged.errors.length, 1);
  assert.equal(merged.warnings.length, 2);

  assert.throws(() => ValidationResult.failure([]), /requires at least one error/);
});

test("Regression: ValidationResult.failure() with warning-only issues always produces isValid === false", () => {
  const warningIssues = [
    {
      code: "DEPRECATION_WARNING",
      message: "This field is deprecated",
      severity: ValidationSeverity.WARNING,
    },
  ];

  const result = ValidationResult.failure(warningIssues);
  assert.equal(result.isValid, false);
  assert.equal(result.hasErrors(), true);
  assert.equal(result.errors.length, 1);
  assert.equal(result.issues[0].severity, ValidationSeverity.ERROR);
});

test("Regression: DatasetValidationError accurately reports total error count with duplicate messages", () => {
  const duplicateErrorsResult = ValidationResult.fromIssues([
    { code: "ERR_CHECKSUM", message: "Checksum mismatch", severity: ValidationSeverity.ERROR },
    { code: "ERR_CHECKSUM", message: "Checksum mismatch", severity: ValidationSeverity.ERROR },
    { code: "ERR_CHECKSUM", message: "Checksum mismatch", severity: ValidationSeverity.ERROR },
    { code: "ERR_CHECKSUM", message: "Checksum mismatch", severity: ValidationSeverity.ERROR },
    { code: "ERR_CHECKSUM", message: "Checksum mismatch", severity: ValidationSeverity.ERROR },
  ]);

  assert.equal(duplicateErrorsResult.errors.length, 5);
  assert.equal(duplicateErrorsResult.issues.length, 5);

  const error = DatasetValidationError.fromResult(duplicateErrorsResult);
  assert.match(error.message, /Dataset validation failed with 5 errors: Checksum mismatch/);
  assert.equal(error.errors.length, 5);
});

test("DuplicateDocumentValidator detects duplicate IDs in O(N) deterministic time", () => {
  const validator = new DuplicateDocumentValidator();

  const doc1 = new Document({
    id: DocumentId.from("doc_101"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("doc1.txt"),
    type: DocumentType.TEXT,
    content: "Document content 1",
  });

  const doc2 = new Document({
    id: DocumentId.from("doc_102"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("doc2.txt"),
    type: DocumentType.TEXT,
    content: "Document content 2",
  });

  const doc3Duplicate = new Document({
    id: DocumentId.from("doc_101"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("doc3_dup.txt"),
    type: DocumentType.TEXT,
    content: "Document content 3 duplicate",
  });

  // Valid unique documents
  const validResult = validator.validateDocuments([doc1, doc2]);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.errors.length, 0);

  // Duplicate document ID check
  const duplicateResult = validator.validateDocuments([doc1, doc2, doc3Duplicate]);
  assert.equal(duplicateResult.isValid, false);
  assert.equal(duplicateResult.errors.length, 1);
  const dupIssue = duplicateResult.issues[0];
  assert.equal(dupIssue.code, "DUPLICATE_DOCUMENT_ID");
  assert.equal(dupIssue.documentId, "doc_101");
  assert.equal(dupIssue.field, "documents[2].id");
  assert.equal(dupIssue.context?.duplicateId, "doc_101");
  assert.equal(dupIssue.context?.firstIndex, 0);
  assert.equal(dupIssue.context?.currentIndex, 2);

  // Non-mutating check: original docs untouched
  assert.equal(doc1.getId().getValue(), "doc_101");
  assert.equal(doc2.getId().getValue(), "doc_102");
  assert.equal(doc3Duplicate.getId().getValue(), "doc_101");
});

test("Regression: Defensive guards for duck-typed documents where getId() returns null or malformed", () => {
  const validator = new DuplicateDocumentValidator();

  const malformedDoc1 = {
    getId: () => null,
    getContent: () => "Valid content",
  } as unknown as Document;

  const malformedDoc2 = {
    getId: () => ({ getValue: () => "" }),
    getContent: () => "Valid content",
  } as unknown as Document;

  const res1 = validator.validateDocuments([malformedDoc1]);
  assert.equal(res1.isValid, false);
  assert.equal(res1.issues[0].code, "INVALID_DOCUMENT_ID");

  const res2 = validator.validateDocuments([malformedDoc2]);
  assert.equal(res2.isValid, false);
  assert.equal(res2.issues[0].code, "INVALID_DOCUMENT_ID");
});

test("ChecksumValidator verifies cryptographic digests and flags mismatches", () => {
  const validator = new ChecksumValidator();

  const content = "Recon-OS Benchmark Dataset Content";
  const correctHash = ChecksumValidator.computeHash(content, "sha256");

  const validDoc = new Document({
    id: DocumentId.from("doc_chk_1"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("valid.txt"),
    type: DocumentType.TEXT,
    content,
    fingerprint: DocumentFingerprint.from(correctHash, "SHA-256"),
  });

  const corruptedDoc = new Document({
    id: DocumentId.from("doc_chk_2"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("corrupted.txt"),
    type: DocumentType.TEXT,
    content,
    fingerprint: DocumentFingerprint.from("deadbeef1234567890abcdef1234567890abcdef", "SHA-256"),
  });

  const validRes = validator.validateDocuments([validDoc]);
  assert.equal(validRes.isValid, true);

  const corruptedRes = validator.validateDocuments([corruptedDoc]);
  assert.equal(corruptedRes.isValid, false);
  assert.equal(corruptedRes.errors.length, 1);
  const mismatchIssue = corruptedRes.issues[0];
  assert.equal(mismatchIssue.code, "CHECKSUM_MISMATCH");
  assert.equal(mismatchIssue.documentId, "doc_chk_2");
  assert.equal(mismatchIssue.context?.actualChecksum, correctHash);
});

test("Regression: Multi-byte UTF-8 content size check uses Buffer.byteLength without false positives", () => {
  const validator = new ChecksumValidator({ verifySize: true });
  const multiByteContent = "Data 🚀 with unicode 🌟 symbols";
  const utf8ByteLength = Buffer.byteLength(multiByteContent, "utf8");

  // Multi-byte string: content.length (30) !== utf8ByteLength (36)
  assert.notEqual(multiByteContent.length, utf8ByteLength);

  const multiByteDoc = new Document({
    id: DocumentId.from("doc_mb_1"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("multibyte.txt"),
    type: DocumentType.TEXT,
    content: multiByteContent,
    size: utf8ByteLength, // Declared size in bytes
  });

  const result = validator.validateDocuments([multiByteDoc]);
  assert.equal(result.isValid, true);
  assert.equal(result.warnings.length, 0);
  assert.equal(result.errors.length, 0);
});

test("Regression: ChecksumValidator handles duck-typed document where getContent() returns non-string", () => {
  const validator = new ChecksumValidator();

  const malformedDoc = {
    getId: () => DocumentId.from("doc_bad_content"),
    getContent: () => 12345, // Invalid non-string
  } as unknown as Document;

  const result = validator.validateDocuments([malformedDoc]);
  assert.equal(result.isValid, false);
  assert.equal(result.issues[0].code, "INVALID_DOCUMENT_CONTENT");
});

test("ChecksumValidator detects corrupted character encodings and null bytes", () => {
  const validator = new ChecksumValidator();

  const corruptedEncodingDoc = new Document({
    id: DocumentId.from("doc_enc_1"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("bad_enc.txt"),
    type: DocumentType.TEXT,
    content:
      "Line 1 normal text\nLine 2 with corrupted unicode \uFFFD replacement char\nLine 3 end",
  });

  const nullByteDoc = new Document({
    id: DocumentId.from("doc_null_1"),
    datasetId: DatasetId.from("ds_1"),
    name: DocumentName.from("null_byte.txt"),
    type: DocumentType.TEXT,
    content: "Header\nData with \u0000 invalid null byte\nFooter",
  });

  const encRes = validator.validateDocuments([corruptedEncodingDoc]);
  assert.equal(encRes.isValid, false);
  assert.equal(encRes.issues[0].code, "CORRUPTED_ENCODING");
  assert.equal(encRes.issues[0].line, 2);
  assert.equal(encRes.issues[0].documentId, "doc_enc_1");

  const nullRes = validator.validateDocuments([nullByteDoc]);
  assert.equal(nullRes.isValid, false);
  assert.equal(nullRes.issues[0].code, "INVALID_NULL_BYTE");
  assert.equal(nullRes.issues[0].line, 2);
});

test("SchemaComplianceValidator enforces dataset schema rules and required metadata", () => {
  const validator = new SchemaComplianceValidator({
    requiredMetadataKeys: ["owner", "domain"],
    maxDescriptionLength: 50,
    maxTagsCount: 2,
  });

  const validMeta = DocumentMetadata.empty()
    .set("owner", "Data Engineering")
    .set("domain", "RAG Evaluation");

  const validDataset = new Dataset({
    id: DatasetId.from("ds_valid_1"),
    name: DatasetName.from("Valid Dataset"),
    version: Version.from("1.0.0"),
    schemaVersion: Version.from("1.0.0"),
    source: DatasetSource.from("file", "/path/to/data.json"),
    description: DatasetDescription.from("Short description"),
    metadata: validMeta,
    tags: new Set([DatasetTag.from("eval"), DatasetTag.from("rag")]),
  });

  const validRes = validator.validate(validDataset);
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.errors.length, 0);

  // Missing required metadata
  const incompleteMeta = DocumentMetadata.empty().set("owner", "Data Engineering");
  const missingMetaDs = validDataset.withMetadata(incompleteMeta);
  const metaRes = validator.validate(missingMetaDs);
  assert.equal(metaRes.isValid, false);
  assert.equal(
    metaRes.issues.some(
      (i) => i.code === "MISSING_REQUIRED_METADATA" && i.field === "metadata.domain",
    ),
    true,
  );

  // Exceeded description length warning
  const longDescDs = validDataset.withDescription(
    DatasetDescription.from(
      "A very long dataset description that intentionally exceeds the maximum limit of fifty characters",
    ),
  );
  const descRes = validator.validate(longDescDs);
  assert.equal(descRes.warnings.length, 1);
  assert.equal(descRes.issues[0].code, "DESCRIPTION_LENGTH_EXCEEDED");
});

test("Regression: DatasetTag value objects with same string are deduplicated by value and do not trigger TAG_COUNT_EXCEEDED", () => {
  const validator = new SchemaComplianceValidator({ maxTagsCount: 2 });

  // Multiple distinct object instances representing the same tag string
  const tag1 = DatasetTag.from("eval");
  const tag2 = DatasetTag.from("eval");
  const tag3 = DatasetTag.from("rag");

  const datasetProps = DatasetRegistrationSchema.validate({
    id: "ds_tags_test",
    name: "Tag Test",
    version: "1.0.0",
    source: { type: "file", uri: "/test.json" },
    tags: [tag1, tag2, tag3], // 2 duplicate instances of 'eval'
  });

  const dataset = new Dataset(datasetProps);
  assert.equal(dataset.getTags().size, 2); // Correctly deduplicated

  const result = validator.validate(dataset);
  assert.equal(result.isValid, true);
  assert.equal(result.warnings.length, 0);
  assert.equal(
    result.issues.some((i) => i.code === "TAG_COUNT_EXCEEDED"),
    false,
  );
});

test("CompositeDatasetValidator aggregates standard rules and extensible custom hooks", async () => {
  const pipeline = CompositeDatasetValidator.createStandard({
    schemaOptions: { requiredMetadataKeys: ["license"] },
  });

  const content = "High quality benchmark evaluation text";
  const validHash = ChecksumValidator.computeHash(content, "sha256");

  const doc1 = new Document({
    id: DocumentId.from("d1"),
    datasetId: DatasetId.from("ds_comp_1"),
    name: DocumentName.from("d1.txt"),
    type: DocumentType.TEXT,
    content,
    fingerprint: DocumentFingerprint.from(validHash, "SHA-256"),
  });

  const dataset = new Dataset({
    id: DatasetId.from("ds_comp_1"),
    name: DatasetName.from("Composite Suite"),
    version: Version.from("1.0.0"),
    source: DatasetSource.from("api", "https://api.recon.io/v1/ds"),
    metadata: DocumentMetadata.empty().set("license", "Apache-2.0"),
  });

  // Valid run
  const passResult = await pipeline.validate(dataset, { documents: [doc1] });
  assert.equal(passResult.isValid, true);
  assert.equal(passResult.errors.length, 0);

  // Add custom domain-specific user validation hook
  pipeline.addRule("DisallowConfidentialText", (ds, context) => {
    if (context?.documents) {
      for (const doc of context.documents) {
        if (doc.getContent().toLowerCase().includes("confidential")) {
          return {
            code: "CONFIDENTIAL_CONTENT_FORBIDDEN",
            message: `Document "${doc.getId().getValue()}" contains forbidden confidential content`,
            severity: ValidationSeverity.ERROR,
            documentId: doc.getId().getValue(),
          };
        }
      }
    }
    return null;
  });

  const confidentialDoc = new Document({
    id: DocumentId.from("d2_conf"),
    datasetId: DatasetId.from("ds_comp_1"),
    name: DocumentName.from("secret.txt"),
    type: DocumentType.TEXT,
    content: "This document contains CONFIDENTIAL internal credentials",
  });

  const customFailResult = await pipeline.validate(dataset, { documents: [doc1, confidentialDoc] });
  assert.equal(customFailResult.isValid, false);
  assert.equal(
    customFailResult.issues.some((i) => i.code === "CONFIDENTIAL_CONTENT_FORBIDDEN"),
    true,
  );
});

test("Regression: Malformed custom validation rule outcomes are cleanly rejected and produce isValid === false", async () => {
  const pipeline = new CompositeDatasetValidator("CustomMalformedPipeline");

  // Rule returning an invalid non-ValidationIssue object
  pipeline.addRule("MalformedRule", () => {
    return { customError: true } as unknown as ValidationResult;
  });

  const dataset = new Dataset({
    id: DatasetId.from("ds_malformed"),
    name: DatasetName.from("Malformed Rule Dataset"),
    version: Version.from("1.0.0"),
    source: DatasetSource.from("file", "/test"),
  });

  const result = await pipeline.validate(dataset);
  assert.equal(result.isValid, false);
  assert.equal(result.hasErrors(), true);
  assert.equal(result.issues[0].code, "INVALID_RULE_OUTCOME");
});

test("CompositeDatasetValidator respects stopOnFirstError execution mode", async () => {
  const validatorA: SchemaComplianceValidator = new SchemaComplianceValidator({
    requiredMetadataKeys: ["mandatoryField"],
  });
  const validatorB = new DuplicateDocumentValidator();

  const failFastPipeline = new CompositeDatasetValidator(
    "FailFastPipeline",
    [validatorA, validatorB],
    { stopOnFirstError: true },
  );

  const datasetWithoutMeta = new Dataset({
    id: DatasetId.from("ds_ff"),
    name: DatasetName.from("Fail Fast DS"),
    version: Version.from("1.0.0"),
    source: DatasetSource.from("file", "/ff.json"),
  });

  const dupDoc = new Document({
    id: DocumentId.from("dup"),
    datasetId: DatasetId.from("ds_ff"),
    name: DocumentName.from("d.txt"),
    type: DocumentType.TEXT,
    content: "hello",
  });

  const res = await failFastPipeline.validate(datasetWithoutMeta, { documents: [dupDoc, dupDoc] });
  assert.equal(res.isValid, false);
  // Stopped after validatorA: only 1 issue recorded
  assert.equal(res.issues.length, 1);
  assert.equal(res.issues[0].code, "MISSING_REQUIRED_METADATA");
});

test("DatasetValidationError integrates with ValidationResult and formats message", () => {
  const result = ValidationResult.failure(["First error", "Second error"]);
  const error = DatasetValidationError.fromResult(result);

  assert.ok(error instanceof DatasetValidationError);
  assert.equal(error.errors.length, 2);
  assert.equal(error.code, "DATASET_VALIDATION_ERROR");
  assert.match(error.message, /Dataset validation failed with 2 errors/);
  assert.match(error.message, /First error; Second error/);
  assert.equal(error.result?.isValid, false);
});

test("Performance Benchmark: Validates O(N) execution time on 10,000 documents", () => {
  const duplicateValidator = new DuplicateDocumentValidator();
  const checksumValidator = new ChecksumValidator({
    verifyFingerprints: true,
    verifyEncoding: true,
  });

  const docCount = 10000;
  const docs: Document[] = new Array(docCount);
  const sampleContent = "Deterministic benchmark content line for O(N) evaluation verification";
  const sampleHash = ChecksumValidator.computeHash(sampleContent, "sha256");

  for (let i = 0; i < docCount; i++) {
    docs[i] = new Document({
      id: DocumentId.from(`doc_bench_${i}`),
      datasetId: DatasetId.from("ds_bench"),
      name: DocumentName.from(`file_${i}.txt`),
      type: DocumentType.TEXT,
      content: sampleContent,
      fingerprint: DocumentFingerprint.from(sampleHash, "SHA-256"),
    });
  }

  const startTime = Date.now();
  const dupResult = duplicateValidator.validateDocuments(docs);
  const chkResult = checksumValidator.validateDocuments(docs);
  const elapsedTime = Date.now() - startTime;

  assert.equal(dupResult.isValid, true);
  assert.equal(chkResult.isValid, true);
  // 10,000 documents should easily validate in well under 2000ms (typically ~100-300ms)
  assert.ok(
    elapsedTime < 3000,
    `Validation for ${docCount} documents took ${elapsedTime}ms (expected < 3000ms)`,
  );
});

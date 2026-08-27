import { test, suite, before } from "node:test";
import { strict as assert } from "node:assert";
import { join } from "node:path";
import {
    DatasetSource,
    DatasetId,
    DocumentType,
    UnsupportedSourceError,
    InvalidDocumentError,
} from "../dist/index.js";
import { PdfFileLoader } from "../dist/dataset/loaders/PdfFileLoader.js";

suite("PdfFileLoader", () => {
    let loader: PdfFileLoader;

    before(() => {
        loader = new PdfFileLoader();
    });

    test("1: Single-page PDF loads successfully, extracted text is correct, correct document type, MIME type is application/pdf", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "simple.pdf");
        const source = DatasetSource.from("file", filePath);
        const dsId = DatasetId.from("ds_test");

        const doc = await loader.load(source, dsId);

        assert.equal(doc.getType(), DocumentType.PDF);
        assert.equal(doc.getMetadata().get<string>("mimeType"), "application/pdf");
        assert.ok(doc.getContent().includes("Hello World"));
        assert.ok(doc.getId().getValue().length > 0);
    });

    test("2: Document identity/fingerprint follows existing conventions", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "simple.pdf");
        const source = DatasetSource.from("file", filePath);
        const dsId = DatasetId.from("ds_test");

        const doc1 = await loader.load(source, dsId);
        const doc2 = await loader.load(source, dsId);

        // Deterministic identity
        assert.equal(doc1.getId().getValue(), doc2.getId().getValue());
        assert.equal(doc1.getFingerprint()?.getChecksum(), doc2.getFingerprint()?.getChecksum());
    });

    test("3: Multi-page PDF: all pages represented, ordering preserved, pageNumber/totalPages correct", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "multi-page.pdf");
        const source = DatasetSource.from("file", filePath);
        const dsId = DatasetId.from("ds_test");

        const doc = await loader.load(source, dsId);
        const content = doc.getContent();
        
        assert.ok(content.includes("Page 1"));
        assert.ok(content.includes("Page 2"));
        assert.ok(content.indexOf("Page 1") < content.indexOf("Page 2"), "Ordering should be preserved");

        const meta = doc.getMetadata();
        assert.equal(meta.get<number>("pageNumber"), 1);
        assert.equal(meta.get<number>("totalPages"), 2);
    });

    test("4: PDF title extracted when present; missing title handled", async () => {
        const titledPath = join(import.meta.dirname, "fixtures", "titled.pdf");
        const docTitled = await loader.load(DatasetSource.from("file", titledPath), DatasetId.from("ds_test"));
        
        assert.equal(docTitled.getMetadata().get<string>("title"), "Test PDF Title");

        const simplePath = join(import.meta.dirname, "fixtures", "simple.pdf");
        const docSimple = await loader.load(DatasetSource.from("file", simplePath), DatasetId.from("ds_test"));
        
        assert.equal(docSimple.getMetadata().get<string>("title"), undefined);
    });

    test("5: Page metadata stored in DocumentMetadata", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "simple.pdf");
        const doc = await loader.load(DatasetSource.from("file", filePath), DatasetId.from("ds_test"));
        
        const meta = doc.getMetadata();
        assert.equal(meta.get<number>("pageNumber"), 1);
        assert.equal(meta.get<number>("totalPages"), 1);
    });

    test("6: Missing PDF throws correct domain error", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "does-not-exist.pdf");
        const source = DatasetSource.from("file", filePath);

        await assert.rejects(
            () => loader.load(source, DatasetId.from("ds_test")),
            UnsupportedSourceError,
        );
    });

    test("7: Unsupported source throws correct domain error", async () => {
        const source = DatasetSource.from("s3", "s3://bucket/test.pdf");

        await assert.rejects(
            () => loader.load(source, DatasetId.from("ds_test")),
            UnsupportedSourceError,
        );
    });

    test("8: Directory source is rejected", async () => {
        const source = DatasetSource.from("file", join(import.meta.dirname, "fixtures"));

        await assert.rejects(
            () => loader.load(source, DatasetId.from("ds_test")),
            UnsupportedSourceError,
        );
    });

    test("9: Corrupted PDF throws InvalidDocumentError", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "corrupted.pdf");
        const source = DatasetSource.from("file", filePath);

        await assert.rejects(
            () => loader.load(source, DatasetId.from("ds_test")),
            InvalidDocumentError,
        );
    });

    test("10: Encrypted PDF throws InvalidDocumentError", async () => {
        const filePath = join(import.meta.dirname, "fixtures", "encrypted.pdf");
        const source = DatasetSource.from("file", filePath);

        await assert.rejects(
            () => loader.load(source, DatasetId.from("ds_test")),
            InvalidDocumentError,
        );
    });
});

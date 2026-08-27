import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { createHash } from "node:crypto";
import * as pdfParseModule from "pdf-parse";

import { BaseFileLoader } from "./BaseFileLoader.js";
import { LocalFileSourceResolver } from "./LocalFileSourceResolver.js";
import { MimeType } from "../value-objects/MimeType.js";
import { DocumentType } from "../enums/DocumentType.js";
import { DatasetId } from "../value-objects/DatasetId.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { DocumentId } from "../value-objects/DocumentId.js";
import { DocumentName } from "../value-objects/DocumentName.js";
import { DocumentFingerprint } from "../value-objects/DocumentFingerprint.js";
import { DocumentMetadata } from "../value-objects/DocumentMetadata.js";
import { Document } from "../entities/Document.js";
import { InvalidDocumentError } from "../errors/DatasetError.js";

const SUPPORTED_EXTENSIONS: ReadonlySet<string> = new Set(["pdf"]);

export class PdfFileLoader extends BaseFileLoader {
    constructor({ maxFileSizeBytes }: { maxFileSizeBytes?: number } = {}) {
        super(new LocalFileSourceResolver(), { maxFileSizeBytes });
    }

    protected getSupportedExtensions(): ReadonlySet<string> {
        return SUPPORTED_EXTENSIONS;
    }

    protected getMimeType(_ext: string): MimeType {
        return MimeType.from("application/pdf");
    }

    protected getDocumentType(_ext: string): DocumentType {
        return DocumentType.PDF;
    }

    public async load(source: DatasetSource, datasetId: DatasetId): Promise<Document> {
        // We cannot use super.load() here because BaseFileLoader.load assumes strict UTF-8 text files
        // and throws InvalidDocumentError when TextDecoder encounters binary PDF data.
        const resolved = await this.resolver.resolve(source);
        const ext = this.extractExtension(resolved.pathOrLocation);
        this.assertSupportedExtension(ext, resolved.pathOrLocation);

        await this.assertFileSizeWithinLimit(resolved.pathOrLocation);

        const rawBuffer = await readFile(resolved.pathOrLocation);

        const sha256hex = createHash("sha256").update(rawBuffer).digest("hex");
        const fingerprint = DocumentFingerprint.from(sha256hex, "SHA-256");

        let textResult, infoResult;
        try {
            const uint8Array = new Uint8Array(rawBuffer);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdf = new (pdfParseModule as any).PDFParse(uint8Array);
            await pdf.load();
            textResult = await pdf.getText();
            infoResult = await pdf.getInfo();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new InvalidDocumentError(
                `File "${resolved.pathOrLocation}" could not be parsed as a PDF: ${message}`
            );
        }

        const mimeValue = resolved.mediaType ?? this.getMimeType(ext).getValue();
        const mime = MimeType.from(mimeValue);

        const docType = this.getDocumentType(ext);
        const filename = basename(resolved.pathOrLocation);
        const sizeBytes = rawBuffer.byteLength;

        const title = infoResult.info?.Title ? String(infoResult.info.Title).trim() : undefined;

        const metadata = DocumentMetadata.from({
            filename,
            extension: ext,
            mimeType: mime.getValue(),
            sourceUri: resolved.uri.getValue(),
            sourcePath: resolved.pathOrLocation,
            sizeBytes,
            pageNumber: 1,
            totalPages: infoResult.total,
            title: title || undefined,
        });

        const id = DocumentId.from(sha256hex);
        const name = DocumentName.from(filename);

        return new Document({
            id,
            datasetId,
            name,
            type: docType,
            content: textResult.text || "",
            fingerprint,
            metadata,
        });
    }
}

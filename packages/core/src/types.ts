/**
 * Core domain model for Recon-OS.
 *
 * These are the shared contracts used across the platform. They describe the
 * shape of data as it moves through the RAG lifecycle: ingestion, chunking,
 * embedding, retrieval, generation, and evaluation. No behavior is defined
 * here; concrete logic lives in the engine packages introduced in later phases.
 */

/** A source document normalized into the canonical Recon-OS representation. */
export interface Document {
  id: string;
  source: string;
  title?: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** A retrievable unit produced by the chunking stage. */
export interface Chunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  metadata: Record<string, unknown>;
}

/** A vector representation of a chunk, produced by the embedding stage. */
export interface Embedding {
  chunkId: string;
  vector: number[];
  model: string;
}

/** A query submitted to the retrieval stage. */
export interface RetrievalQuery {
  text: string;
  topK: number;
}

/** A single retrieved chunk with its relevance score. */
export interface RetrievalResult {
  chunk: Chunk;
  score: number;
}

/** Input to the generation stage. */
export interface GenerationRequest {
  query: string;
  context: Chunk[];
}

/** Output of the generation stage. */
export interface GenerationResponse {
  answer: string;
  model: string;
}

/** A named, numeric evaluation result. */
export interface EvaluationMetric {
  name: string;
  value: number;
}

/** A recorded experiment comparing a configuration against a dataset. */
export interface Experiment {
  id: string;
  name: string;
  datasetId: string;
  metrics: EvaluationMetric[];
}

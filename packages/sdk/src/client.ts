/**
 * Public SDK contract for Recon-OS.
 *
 * Reserved surface for the future client. Only the shape of the API is defined
 * here; concrete transport, authentication, and providers are implemented in a
 * later phase. Method signatures use `unknown` payloads deliberately so the
 * contract can be finalized without committing to internal types prematurely.
 */

/** Options used to construct a Recon-OS client. */
export interface ReconOSClientOptions {
  baseUrl: string;
  apiKey?: string;
}

/** The client contract applications use to talk to a Recon-OS deployment. */
export interface ReconOSClient {
  /** Retrieve the top-K relevant chunks for a query. */
  retrieve(query: string, topK: number): Promise<unknown[]>;
  /** Run an evaluation against a dataset and return its result. */
  evaluate(datasetId: string): Promise<unknown>;
}

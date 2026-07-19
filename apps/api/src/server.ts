/**
 * Server contract for the Recon-OS API.
 *
 * Reserved interface; the concrete transport (HTTP framework, routes, handlers,
 * and middleware) is implemented in a later phase. Defining the contract now
 * gives the API package a clear, importable surface.
 */

/** Options used to start the API server. */
export interface ApiServerOptions {
  port: number;
  host: string;
}

/** The lifecycle contract the API server implements. */
export interface ApiServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

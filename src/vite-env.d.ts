/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Tickify API, e.g. https://localhost:7003 */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

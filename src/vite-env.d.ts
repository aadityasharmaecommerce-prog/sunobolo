/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REMOTE_API?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ADMIN_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

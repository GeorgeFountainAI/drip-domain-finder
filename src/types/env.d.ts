/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SPACESHIP_AFF?: string
  readonly VITE_SPACESHIP_CAMPAIGN?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
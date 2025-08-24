/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SPACESHIP_AFF?: string
  readonly VITE_SPACESHIP_CAMPAIGN?: string
  readonly VITE_CJ_DEEPLINK_BASE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
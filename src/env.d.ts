/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly TELEGRAM_BOT_TOKEN: string;
  readonly TELEGRAM_CHAT_ID: string;
  readonly GITHUB_REPO_OWNER: string;
  readonly GITHUB_REPO_NAME: string;
  readonly KEYSTATIC_GITHUB_CLIENT_ID: string;
  readonly KEYSTATIC_GITHUB_CLIENT_SECRET: string;
  readonly KEYSTATIC_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

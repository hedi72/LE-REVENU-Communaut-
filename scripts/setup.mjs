import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const key = () => randomBytes(32).toString('hex');
const rootPath = new URL('.env', root);
if (!existsSync(rootPath))
  writeFileSync(
    rootPath,
    `POSTGRES_DB=lerevenu\nPOSTGRES_USER=lerevenu\nPOSTGRES_PASSWORD=${key()}\n`,
  );
const rootEnv = readFileSync(rootPath, 'utf8');
const password = rootEnv.match(/^POSTGRES_PASSWORD=(.+)$/m)?.[1]?.trim();
if (!password) throw new Error('POSTGRES_PASSWORD manquant dans .env');
const apiPath = new URL('apps/api/.env', root);
if (!existsSync(apiPath)) {
  const values = {
    DATABASE_PASSWORD: password,
    APP_KEYS: `${key()},${key()}`,
    API_TOKEN_SALT: key(),
    ADMIN_JWT_SECRET: key(),
    TRANSFER_TOKEN_SALT: key(),
    JWT_SECRET: key(),
    ENCRYPTION_KEY: key(),
    DEMO_PASSWORD: key().slice(0, 24),
  };
  let template = readFileSync(new URL('apps/api/.env.example', root), 'utf8');
  for (const [name, value] of Object.entries(values))
    template = template.replace(new RegExp(`^${name}=.*$`, 'm'), `${name}=${value}`);
  writeFileSync(apiPath, template);
}
const webPath = new URL('apps/web/.env.local', root);
if (!existsSync(webPath))
  writeFileSync(webPath, readFileSync(new URL('apps/web/.env.example', root)));
console.log(
  `Configuration locale prête. Identifiants de démonstration : camille@example.com ou thomas@example.com.\nMot de passe : valeur DEMO_PASSWORD dans ${fileURLToPath(apiPath)}.\nLes fichiers existants ont été conservés.`,
);

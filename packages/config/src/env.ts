import { z } from "zod";

const bool = z
  .string()
  .optional()
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["dev", "staging", "prod"]).default("dev"),

  DATABASE_URL: z.string().min(1).optional(),
  OLD_DATABASE_URL: z.string().min(1).optional(),

  AUTHENTIK_BASE_URL: z.string().url().optional(),
  AUTHENTIK_CLIENT_ID: z.string().min(1).optional(),
  AUTHENTIK_CLIENT_SECRET: z.string().min(1).optional(),
  AUTHENTIK_ISSUER: z.string().url().optional(),

  DIRECTUS_URL: z.string().url().optional(),
  DIRECTUS_TOKEN: z.string().min(1).optional(),

  MINIO_ENDPOINT: z.string().url().optional(),
  MINIO_ACCESS_KEY: z.string().min(1).optional(),
  MINIO_SECRET_KEY: z.string().min(1).optional(),
  MINIO_BUCKET: z.string().min(1).optional(),
  MINIO_REGION: z.string().min(1).default("us-east-1"),
  MINIO_FORCE_PATH_STYLE: bool,

  REDIS_URL: z.string().min(1).optional(),

  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_HTTP_RELAY_URL: z.string().url().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  SHIPPO_API_TOKEN: z.string().min(1).optional(),
  SHIPPO_WEBHOOK_SECRET: z.string().min(1).optional(),

  GRAFANA_URL: z.string().url().optional(),
  LOKI_URL: z.string().url().optional(),
  PROMETHEUS_URL: z.string().url().optional(),
  TEMPO_URL: z.string().url().optional(),

  KMS_KEY_ID: z.string().min(1).optional(),
  FIELD_ENCRYPTION_KEY_B64: z.string().min(32).optional(),
  FIELD_HASH_SALT: z.string().min(16).optional(),

  LOG_RETENTION_MONTHS: z.coerce.number().int().positive().default(13),
  REQUIRE_STAFF_MFA: bool,
  ENFORCE_SELF_HOSTED_REQUIRED: bool,

  // Deprecated legacy assumptions retained only for migration compatibility.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SANITY_PROJECT_ID: z.string().min(1).optional(),
  SANITY_DATASET: z.string().min(1).optional(),
  SANITY_API_TOKEN: z.string().min(1).optional(),
  BREVO_API_KEY: z.string().min(1).optional(),
  DATADOG_API_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

function enforceRequiredSelfHostedKeys(env: AppEnv): void {
  const shouldEnforce = env.ENFORCE_SELF_HOSTED_REQUIRED || env.APP_ENV !== "dev";
  if (!shouldEnforce) {
    return;
  }

  const requiredKeys: Array<keyof AppEnv> = [
    "DATABASE_URL",
    "AUTHENTIK_BASE_URL",
    "AUTHENTIK_CLIENT_ID",
    "AUTHENTIK_CLIENT_SECRET",
    "DIRECTUS_URL",
    "DIRECTUS_TOKEN",
    "MINIO_ENDPOINT",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
    "MINIO_BUCKET",
    "REDIS_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_HTTP_RELAY_URL",
    "SMTP_FROM_EMAIL",
    "SMTP_FROM_NAME",
    "FIELD_ENCRYPTION_KEY_B64",
    "FIELD_HASH_SALT",
  ];

  const missing = requiredKeys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required self-hosted env keys: ${missing.join(", ")}`);
  }
}

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const normalizedEnv = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, value === "" ? undefined : value]),
  );

  const parsed = envSchema.safeParse(normalizedEnv);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "env";
    throw new Error(`Invalid environment config: ${path} ${issue.message}`);
  }

  enforceRequiredSelfHostedKeys(parsed.data);
  cachedEnv = parsed.data;
  return cachedEnv;
}

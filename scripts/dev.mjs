#!/usr/bin/env node

import { randomBytes } from "crypto";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envExamplePath = path.join(rootDir, ".env.example");
const rootEnvLocalPath = path.join(rootDir, ".env.local");
const generatedHeader = "# Managed by scripts/dev.mjs";
const appNames = ["landing", "store", "admin", "customer", "b2b", "team"];

const requiredKeySpecs = [
  { key: "NODE_ENV", description: "Node runtime environment", defaultValue: "development" },
  { key: "APP_ENV", description: "Application environment", defaultValue: "dev" },
  {
    key: "ENFORCE_SELF_HOSTED_REQUIRED",
    description: "Enforce required self-hosted keys validation",
    defaultValue: "false",
  },
  { key: "MINIO_REGION", description: "MinIO region", defaultValue: "us-east-1" },
  {
    key: "MINIO_FORCE_PATH_STYLE",
    description: "MinIO path-style URLs",
    defaultValue: "true",
  },
  { key: "SMTP_PORT", description: "Managed SMTP port", defaultValue: "587" },
  { key: "SMTP_FROM_NAME", description: "Default sender name", defaultValue: "Zevlin Bike" },
  {
    key: "FIELD_ENCRYPTION_KEY_B64",
    description: "Field encryption key (base64 32 bytes)",
    defaultValue: randomBytes(32).toString("base64"),
  },
  {
    key: "FIELD_HASH_SALT",
    description: "Deterministic hash salt",
    defaultValue: randomBytes(16).toString("hex"),
  },
  { key: "LOG_RETENTION_MONTHS", description: "Log retention in months", defaultValue: "13" },
  { key: "REQUIRE_STAFF_MFA", description: "Require MFA for staff", defaultValue: "true" },
];

const optionalKeySpecs = [
  { key: "DATABASE_URL", description: "Primary Postgres connection URL" },
  { key: "OLD_DATABASE_URL", description: "Legacy Postgres connection URL" },
  { key: "AUTHENTIK_BASE_URL", description: "Authentik base URL" },
  { key: "AUTHENTIK_CLIENT_ID", description: "Authentik OAuth client ID" },
  { key: "AUTHENTIK_CLIENT_SECRET", description: "Authentik OAuth client secret" },
  { key: "AUTHENTIK_ISSUER", description: "Authentik issuer URL (optional)" },
  { key: "DIRECTUS_URL", description: "Directus base URL" },
  { key: "DIRECTUS_TOKEN", description: "Directus API token" },
  { key: "MINIO_ENDPOINT", description: "MinIO endpoint URL" },
  { key: "MINIO_ACCESS_KEY", description: "MinIO access key" },
  { key: "MINIO_SECRET_KEY", description: "MinIO secret key" },
  { key: "MINIO_BUCKET", description: "MinIO bucket name" },
  { key: "REDIS_URL", description: "Redis connection URL" },
  { key: "SMTP_HOST", description: "Managed SMTP host" },
  { key: "SMTP_USER", description: "Managed SMTP user" },
  { key: "SMTP_PASS", description: "Managed SMTP password" },
  { key: "SMTP_HTTP_RELAY_URL", description: "Managed SMTP HTTP relay URL" },
  { key: "SMTP_FROM_EMAIL", description: "SMTP sender email" },
  { key: "STRIPE_SECRET_KEY", description: "Stripe secret key" },
  { key: "STRIPE_WEBHOOK_SECRET", description: "Stripe webhook secret" },
  { key: "SHIPPO_API_TOKEN", description: "Shippo API token" },
  { key: "SHIPPO_WEBHOOK_SECRET", description: "Shippo webhook secret" },
  { key: "GRAFANA_URL", description: "Grafana URL" },
  { key: "LOKI_URL", description: "Loki URL" },
  { key: "PROMETHEUS_URL", description: "Prometheus URL" },
  { key: "TEMPO_URL", description: "Tempo URL" },
  { key: "KMS_KEY_ID", description: "KMS key identifier" },
];

function parseArgs(argv) {
  const flags = new Set(argv);
  return {
    wizardOnly: flags.has("--wizard-only"),
    nonInteractive: flags.has("--non-interactive"),
    skipOptional: flags.has("--skip-optional"),
    forceWizard: flags.has("--force-wizard"),
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseEnvText(text) {
  const result = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim();
    const unquoted =
      value.startsWith('"') && value.endsWith('"')
        ? value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")
        : value;
    result[key] = unquoted;
  }

  return result;
}

function formatEnvValue(value) {
  const normalized = value == null ? "" : String(value);
  if (normalized === "") {
    return "";
  }

  if (/\s|#/.test(normalized)) {
    return `"${normalized.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
  }

  return normalized;
}

function parseTemplateLines(templateText) {
  return templateText.split(/\r?\n/);
}

async function prompt(rl, label, currentValue, defaultValue) {
  const placeholder = currentValue || defaultValue || "";
  const suffix = placeholder ? ` [${placeholder}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();

  if (answer) {
    return answer;
  }

  if (currentValue) {
    return currentValue;
  }

  if (defaultValue) {
    return defaultValue;
  }

  return "";
}

async function runWizard({ existingValues, interactive, skipOptional }) {
  const values = { ...existingValues };
  let rl = null;

  if (interactive) {
    rl = readline.createInterface({ input, output });
    console.log("\nZevlin local environment wizard\n");
    console.log("Fill required values first. Press enter to accept defaults.\n");
  }

  for (const spec of requiredKeySpecs) {
    const current = values[spec.key] || "";
    if (current) {
      continue;
    }

    if (!interactive) {
      values[spec.key] = spec.defaultValue;
      continue;
    }

    values[spec.key] = await prompt(
      rl,
      `${spec.key} (${spec.description})`,
      current,
      spec.defaultValue,
    );
  }

  if (interactive && !skipOptional) {
    const configureOptional = await rl.question(
      "\nConfigure optional integration keys now? (y/N): ",
    );

    if (configureOptional.trim().toLowerCase() === "y") {
      for (const spec of optionalKeySpecs) {
        values[spec.key] = await prompt(
          rl,
          `${spec.key} (${spec.description})`,
          values[spec.key] || "",
          "",
        );
      }
    }
  }

  if (rl) {
    rl.close();
  }

  return values;
}

function buildEnvLocalText(templateLines, values) {
  const rendered = [generatedHeader, "# Canonical local environment for monorepo apps", ""];

  for (const line of templateLines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      rendered.push(line);
      continue;
    }

    const key = match[1];
    const value = key in values ? values[key] : "";
    rendered.push(`${key}=${formatEnvValue(value)}`);
  }

  if (rendered[rendered.length - 1] !== "") {
    rendered.push("");
  }

  return rendered.join("\n");
}

async function syncEnvToApps(rootEnvText, rootValues) {
  const rootWithoutHeader = rootEnvText
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(generatedHeader))
    .join("\n")
    .replace(/^\n+/, "");

  for (const app of appNames) {
    const appPath = path.join(rootDir, "apps", app);
    const appEnvPath = path.join(appPath, ".env.local");

    const exists = await fileExists(appEnvPath);
    if (!exists) {
      const content = `${generatedHeader}\n# Synced from ../../.env.local\n\n${rootWithoutHeader}`;
      await fs.writeFile(appEnvPath, content, "utf8");
      continue;
    }

    const existingText = await fs.readFile(appEnvPath, "utf8");
    if (existingText.includes(generatedHeader)) {
      const content = `${generatedHeader}\n# Synced from ../../.env.local\n\n${rootWithoutHeader}`;
      await fs.writeFile(appEnvPath, content, "utf8");
      continue;
    }

    const existingValues = parseEnvText(existingText);
    const missing = [];

    for (const [key, value] of Object.entries(rootValues)) {
      if (!existingValues[key] && value) {
        missing.push(`${key}=${formatEnvValue(value)}`);
      }
    }

    if (missing.length > 0) {
      const appended = `${existingText.trimEnd()}\n\n# Added by scripts/dev.mjs (missing keys)\n${missing.join("\n")}\n`;
      await fs.writeFile(appEnvPath, appended, "utf8");
    }
  }
}

async function ensureEnvSetup(options) {
  const templateText = await fs.readFile(envExamplePath, "utf8");
  const templateLines = parseTemplateLines(templateText);

  const existingValues = (await fileExists(rootEnvLocalPath))
    ? parseEnvText(await fs.readFile(rootEnvLocalPath, "utf8"))
    : {};

  const missingRequired = requiredKeySpecs
    .map((spec) => spec.key)
    .filter((key) => !existingValues[key]);

  const interactive = !options.nonInteractive && input.isTTY;
  const shouldRunWizard = options.forceWizard || missingRequired.length > 0;

  let finalValues = existingValues;
  if (shouldRunWizard) {
    finalValues = await runWizard({
      existingValues,
      interactive,
      skipOptional: options.skipOptional,
    });

    const missingAfterWizard = requiredKeySpecs
      .map((spec) => spec.key)
      .filter((key) => !finalValues[key]);

    if (missingAfterWizard.length > 0) {
      console.error(`Missing required env values: ${missingAfterWizard.join(", ")}`);
      process.exit(1);
    }

    if (missingRequired.length > 0) {
      console.log(`Configured required env values: ${missingRequired.join(", ")}`);
    } else {
      console.log("Wizard completed. Existing required values were kept unless edited.");
    }
  } else {
    console.log("Required env keys already configured.");
  }

  const envText = buildEnvLocalText(templateLines, finalValues);
  await fs.writeFile(rootEnvLocalPath, envText, "utf8");
  await syncEnvToApps(envText, finalValues);

  console.log("Environment setup complete. Root and app .env.local files are synchronized.");
}

function resolveTurboBin() {
  const binName = process.platform === "win32" ? "turbo.cmd" : "turbo";
  return path.join(rootDir, "node_modules", ".bin", binName);
}

async function ensureWorkspaceDependencies() {
  const nextBinName = process.platform === "win32" ? "next.cmd" : "next";
  const devAppNames = [...appNames, "old_website"];
  const missingApps = [];

  for (const app of devAppNames) {
    const nextBin = path.join(rootDir, "apps", app, "node_modules", ".bin", nextBinName);
    if (!(await fileExists(nextBin))) {
      missingApps.push(app);
    }
  }

  if (missingApps.length > 0) {
    console.error(
      `Missing app dependencies for: ${missingApps.join(", ")}. Install workspace dependencies and retry.`,
    );
    console.error("Suggested command: pnpm install");
    process.exit(1);
  }
}

async function runDevServer() {
  const turboBin = resolveTurboBin();
  if (!(await fileExists(turboBin))) {
    console.error("Missing turbo binary. Install dependencies first (pnpm install). ");
    process.exit(1);
  }

  await ensureWorkspaceDependencies();

  await new Promise((resolve, reject) => {
    const child = spawn(turboBin, ["run", "dev", "--parallel"], {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      if (typeof code === "number" && code !== 0) {
        process.exitCode = code;
      }

      resolve();
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await ensureEnvSetup(options);

  if (options.wizardOnly) {
    return;
  }

  await runDevServer();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

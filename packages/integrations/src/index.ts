import { createHmac } from "crypto";
import { getEnv } from "@zevlin/config";

export type StripeCheckoutSessionInput = {
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type ShippoRateQuoteInput = {
  addressFrom: Record<string, string>;
  addressTo: Record<string, string>;
  parcel: {
    length: string;
    width: string;
    height: string;
    distance_unit: "cm";
    weight: string;
    mass_unit: "g";
  };
};

export type ShippoPurchaseLabelInput = {
  rateObjectId: string;
  metadata?: string;
};

export type ShippoVoidLabelInput = {
  labelObjectId: string;
};

export type DirectusQuery = {
  fields?: string[];
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
};

export type DirectusListResponse<T> = {
  data: T[];
};

export type DirectusItemResponse<T> = {
  data: T;
};

export type SmtpMail = {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
};

export type MinioSignedUrlInput = {
  objectKey: string;
  method: "GET" | "PUT";
  expiresSeconds?: number;
};

function must(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}

function authHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function buildDirectusQueryString(query?: DirectusQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.fields?.length) {
    params.set("fields", query.fields.join(","));
  }

  if (query.sort?.length) {
    params.set("sort", query.sort.join(","));
  }

  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }

  if (query.filter) {
    params.set("filter", JSON.stringify(query.filter));
  }

  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export async function createStripeCheckoutSession(
  input: StripeCheckoutSessionInput,
): Promise<{ id: string; url: string }> {
  const env = getEnv();
  const apiKey = must(env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");

  const body = new URLSearchParams({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "line_items[0][price_data][currency]": input.currency,
    "line_items[0][price_data][product_data][name]": "Zevlin Bike Order",
    "line_items[0][price_data][unit_amount]": String(input.amountCents),
    "line_items[0][quantity]": "1",
  });

  for (const [key, value] of Object.entries(input.metadata ?? {})) {
    body.set(`metadata[${key}]`, value);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Stripe session creation failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { id: string; url: string };
  return { id: payload.id, url: payload.url };
}

export async function getShippoRates(input: ShippoRateQuoteInput): Promise<unknown> {
  const env = getEnv();
  const token = must(env.SHIPPO_API_TOKEN, "SHIPPO_API_TOKEN");

  const response = await fetch("https://api.goshippo.com/shipments", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      async: false,
      address_from: input.addressFrom,
      address_to: input.addressTo,
      parcels: [input.parcel],
    }),
  });

  if (!response.ok) {
    throw new Error(`Shippo rates request failed with status ${response.status}`);
  }

  return response.json();
}

export async function purchaseShippoLabel(
  input: ShippoPurchaseLabelInput,
): Promise<Record<string, unknown>> {
  const env = getEnv();
  const token = must(env.SHIPPO_API_TOKEN, "SHIPPO_API_TOKEN");

  const response = await fetch("https://api.goshippo.com/transactions", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rate: input.rateObjectId,
      label_file_type: "PDF",
      metadata: input.metadata,
      async: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shippo label purchase failed with status ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function voidShippoLabel(
  input: ShippoVoidLabelInput,
): Promise<Record<string, unknown>> {
  const env = getEnv();
  const token = must(env.SHIPPO_API_TOKEN, "SHIPPO_API_TOKEN");

  const response = await fetch(
    `https://api.goshippo.com/transactions/${input.labelObjectId}/void`,
    {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ async: false }),
    },
  );

  if (!response.ok) {
    throw new Error(`Shippo label void failed with status ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export const directusClient = {
  async listItems<T>(collection: string, query?: DirectusQuery): Promise<T[]> {
    const env = getEnv();
    const baseUrl = must(env.DIRECTUS_URL, "DIRECTUS_URL").replace(/\/$/, "");
    const token = must(env.DIRECTUS_TOKEN, "DIRECTUS_TOKEN");

    const response = await fetch(
      `${baseUrl}/items/${collection}${buildDirectusQueryString(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Directus list failed for ${collection} (${response.status})`);
    }

    const payload = (await response.json()) as DirectusListResponse<T>;
    return payload.data;
  },

  async getItem<T>(collection: string, id: string, query?: DirectusQuery): Promise<T> {
    const env = getEnv();
    const baseUrl = must(env.DIRECTUS_URL, "DIRECTUS_URL").replace(/\/$/, "");
    const token = must(env.DIRECTUS_TOKEN, "DIRECTUS_TOKEN");

    const response = await fetch(
      `${baseUrl}/items/${collection}/${id}${buildDirectusQueryString(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Directus get failed for ${collection}/${id} (${response.status})`);
    }

    const payload = (await response.json()) as DirectusItemResponse<T>;
    return payload.data;
  },

  async createItem<T extends Record<string, unknown>>(
    collection: string,
    data: T,
  ): Promise<T> {
    const env = getEnv();
    const baseUrl = must(env.DIRECTUS_URL, "DIRECTUS_URL").replace(/\/$/, "");
    const token = must(env.DIRECTUS_TOKEN, "DIRECTUS_TOKEN");

    const response = await fetch(`${baseUrl}/items/${collection}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Directus create failed for ${collection} (${response.status})`);
    }

    const payload = (await response.json()) as DirectusItemResponse<T>;
    return payload.data;
  },

  async updateItem<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    const env = getEnv();
    const baseUrl = must(env.DIRECTUS_URL, "DIRECTUS_URL").replace(/\/$/, "");
    const token = must(env.DIRECTUS_TOKEN, "DIRECTUS_TOKEN");

    const response = await fetch(`${baseUrl}/items/${collection}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Directus update failed for ${collection}/${id} (${response.status})`);
    }

    const payload = (await response.json()) as DirectusItemResponse<T>;
    return payload.data;
  },
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export const smtpMailer = {
  async send(mail: SmtpMail): Promise<void> {
    const env = getEnv();
    const host = must(env.SMTP_HOST, "SMTP_HOST");
    const port = env.SMTP_PORT ?? 587;
    const user = must(env.SMTP_USER, "SMTP_USER");
    const pass = must(env.SMTP_PASS, "SMTP_PASS");
    const fromEmail = must(env.SMTP_FROM_EMAIL, "SMTP_FROM_EMAIL");
    const fromName = env.SMTP_FROM_NAME ?? "Zevlin Bike";

    // Managed SMTP providers commonly expose an API relay endpoint for app integrations.
    // If SMTP_HTTP_RELAY_URL is configured, we use it as the transport to avoid embedding
    // provider-specific SDK dependencies.
    const relayUrl = process.env.SMTP_HTTP_RELAY_URL;
    if (relayUrl) {
      const response = await fetch(relayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(user, pass),
        },
        body: JSON.stringify({
          host,
          port,
          from: { email: fromEmail, name: fromName },
          to: mail.to,
          subject: mail.subject,
          html: mail.htmlContent,
          text: mail.textContent ?? stripHtml(mail.htmlContent),
        }),
      });

      if (!response.ok) {
        throw new Error(`SMTP relay request failed (${response.status})`);
      }

      return;
    }

    // Fallback: no relay endpoint configured.
    throw new Error(
      "SMTP_HTTP_RELAY_URL is required for smtpMailer.send in this runtime. Configure your managed SMTP relay endpoint.",
    );
  },
};

function normalizeObjectKey(key: string): string {
  return key.replace(/^\/+/, "");
}

function buildMinioBaseObjectUrl(objectKey: string): string {
  const env = getEnv();
  const endpoint = must(env.MINIO_ENDPOINT, "MINIO_ENDPOINT").replace(/\/$/, "");
  const bucket = must(env.MINIO_BUCKET, "MINIO_BUCKET");
  const normalizedKey = normalizeObjectKey(objectKey)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${endpoint}/${bucket}/${normalizedKey}`;
}

export const minioStorage = {
  objectUrl(objectKey: string): string {
    return buildMinioBaseObjectUrl(objectKey);
  },

  createSignedUrl(input: MinioSignedUrlInput): string {
    const env = getEnv();
    const secret = must(env.MINIO_SECRET_KEY, "MINIO_SECRET_KEY");
    const expiresSeconds = input.expiresSeconds ?? 15 * 60;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresSeconds;
    const objectKey = normalizeObjectKey(input.objectKey);
    const baseUrl = buildMinioBaseObjectUrl(objectKey);

    // App-level HMAC signature used by Zevlin middleware/proxy authorization logic.
    // This is not the native S3 signature flow; it secures generated links for app routes.
    const payload = `${input.method}:${objectKey}:${expiresAt}`;
    const signature = createHmac("sha256", secret).update(payload).digest("hex");

    return `${baseUrl}?zevlin_method=${input.method}&zevlin_expires=${expiresAt}&zevlin_sig=${signature}`;
  },

  createUploadInstruction(objectKey: string, expiresSeconds = 15 * 60): {
    method: "PUT";
    url: string;
    requiredHeaders: Record<string, string>;
  } {
    return {
      method: "PUT",
      url: this.createSignedUrl({ objectKey, method: "PUT", expiresSeconds }),
      requiredHeaders: {
        "x-zevlin-storage": "minio",
      },
    };
  },

  createDownloadInstruction(objectKey: string, expiresSeconds = 15 * 60): {
    method: "GET";
    url: string;
  } {
    return {
      method: "GET",
      url: this.createSignedUrl({ objectKey, method: "GET", expiresSeconds }),
    };
  },
};

// Deprecated compatibility paths retained while legacy code is still being replaced.
export async function fetchSanityQuery<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  const env = getEnv();
  const projectId = must(env.SANITY_PROJECT_ID, "SANITY_PROJECT_ID");
  const dataset = must(env.SANITY_DATASET, "SANITY_DATASET");
  const token = must(env.SANITY_API_TOKEN, "SANITY_API_TOKEN");

  const response = await fetch(
    `https://${projectId}.api.sanity.io/v2023-08-01/data/query/${dataset}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, params }),
    },
  );

  if (!response.ok) {
    throw new Error(`Sanity query failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function sendBrevoEmail(payload: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const env = getEnv();
  const apiKey = must(env.BREVO_API_KEY, "BREVO_API_KEY");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: "no-reply@zevlin.com",
        name: "Zevlin Bike",
      },
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo send failed with status ${response.status}`);
  }
}

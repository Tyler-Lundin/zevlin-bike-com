"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "../../lib/analytics";

type PrivacyValues = {
  requestType: "access" | "deletion" | "correction" | "portability" | "do_not_sell" | "other";
  name: string;
  email: string;
  jurisdiction: string;
  message: string;
  consent: boolean;
  website: string;
};

const emptyValues: PrivacyValues = {
  requestType: "access",
  name: "",
  email: "",
  jurisdiction: "",
  message: "",
  consent: false,
  website: "",
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `landing-privacy-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PrivacyRequestForm() {
  const [values, setValues] = useState<PrivacyValues>(emptyValues);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof PrivacyValues>(field: K, value: PrivacyValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    const payload = {
      requestType: values.requestType,
      name: values.name,
      email: values.email,
      jurisdiction: values.jurisdiction || undefined,
      message: values.message || undefined,
      consent: values.consent,
      source: "landing-privacy-request",
      website: values.website || undefined,
    };

    try {
      const response = await fetch("/api/privacy/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": createIdempotencyKey(),
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as { message?: string; requestId?: string; error?: string };
      if (!response.ok) {
        setError(json.error ?? "Unable to submit privacy request.");
        trackEvent("privacy_request_failed", { httpStatus: response.status });
        return;
      }

      setMessage(json.message ?? "Privacy request submitted.");
      setValues(emptyValues);
      trackEvent("privacy_request_submitted", {
        requestId: json.requestId ?? "unknown",
        requestType: payload.requestType,
      });
    } catch {
      setError("Network error. Please try again.");
      trackEvent("privacy_request_failed", { errorType: "network" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <label htmlFor="privacy-request-type">Request Type</label>
      <select
        id="privacy-request-type"
        name="requestType"
        value={values.requestType}
        onChange={(event) =>
          updateField(
            "requestType",
            event.target.value as PrivacyValues["requestType"],
          )
        }
        required
      >
        <option value="access">Access my data</option>
        <option value="deletion">Delete my data</option>
        <option value="correction">Correct my data</option>
        <option value="portability">Export my data</option>
        <option value="do_not_sell">Do not sell/share</option>
        <option value="other">Other privacy request</option>
      </select>

      <label htmlFor="privacy-name">Full Name</label>
      <input
        id="privacy-name"
        name="name"
        value={values.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />

      <label htmlFor="privacy-email">Email</label>
      <input
        id="privacy-email"
        name="email"
        type="email"
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
        required
      />

      <label htmlFor="privacy-jurisdiction">State/Country (optional)</label>
      <input
        id="privacy-jurisdiction"
        name="jurisdiction"
        value={values.jurisdiction}
        onChange={(event) => updateField("jurisdiction", event.target.value)}
      />

      <label htmlFor="privacy-message">Details (optional)</label>
      <textarea
        id="privacy-message"
        name="message"
        rows={6}
        value={values.message}
        onChange={(event) => updateField("message", event.target.value)}
      />

      <div className="checkbox-row">
        <input
          id="privacy-consent"
          name="consent"
          type="checkbox"
          checked={values.consent}
          onChange={(event) => updateField("consent", event.target.checked)}
          required
        />
        <label htmlFor="privacy-consent" className="checkbox-label">
          I confirm this request is for my personal information and I agree to be contacted by email.
        </label>
      </div>

      <input
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        className="honeypot"
        name="website"
        value={values.website}
        onChange={(event) => updateField("website", event.target.value)}
      />

      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit Privacy Request"}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
      {error ? <p className="form-status form-status-error">{error}</p> : null}
    </form>
  );
}

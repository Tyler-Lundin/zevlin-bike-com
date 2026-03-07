"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "../../lib/analytics";

type ReturnValues = {
  orderNumber: string;
  name: string;
  email: string;
  message: string;
};

const emptyValues: ReturnValues = {
  orderNumber: "",
  name: "",
  email: "",
  message: "",
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `landing-returns-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ReturnRequestForm() {
  const [values, setValues] = useState<ReturnValues>(emptyValues);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ReturnValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    const payload = {
      orderNumber: values.orderNumber,
      name: values.name || undefined,
      email: values.email || undefined,
      message: values.message || undefined,
    };

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": createIdempotencyKey(),
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as { message?: string; requestId?: string; error?: string };
      if (!response.ok) {
        setError(json.error ?? "Unable to submit return request.");
        trackEvent("return_request_failed", { httpStatus: response.status });
        return;
      }

      setMessage(json.message ?? "Return request submitted.");
      setValues(emptyValues);
      trackEvent("return_request_submitted", { requestId: json.requestId ?? "unknown" });
    } catch {
      setError("Network error. Please try again.");
      trackEvent("return_request_failed", { errorType: "network" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <label htmlFor="returns-order-number">Order Number</label>
      <input
        id="returns-order-number"
        name="orderNumber"
        value={values.orderNumber}
        onChange={(event) => updateField("orderNumber", event.target.value)}
        required
      />

      <label htmlFor="returns-name">Name (optional)</label>
      <input
        id="returns-name"
        name="name"
        value={values.name}
        onChange={(event) => updateField("name", event.target.value)}
      />

      <label htmlFor="returns-email">Email (optional)</label>
      <input
        id="returns-email"
        name="email"
        type="email"
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
      />

      <label htmlFor="returns-message">Additional Info (optional)</label>
      <textarea
        id="returns-message"
        name="message"
        rows={5}
        value={values.message}
        onChange={(event) => updateField("message", event.target.value)}
      />

      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit Return Request"}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
      {error ? <p className="form-status form-status-error">{error}</p> : null}
    </form>
  );
}

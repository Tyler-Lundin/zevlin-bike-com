"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "../../lib/analytics";

type ContactValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `landing-contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyValues: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactSubmissionForm() {
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ContactValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": createIdempotencyKey(),
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string; submissionId?: string; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to send your message right now.");
        trackEvent("contact_submission_failed", { httpStatus: response.status });
        return;
      }

      setMessage(payload.message ?? "Thanks, we received your message.");
      setValues(emptyValues);
      trackEvent("contact_submission_sent", {
        submissionId: payload.submissionId ?? "unknown",
      });
    } catch {
      setError("Network error. Please try again.");
      trackEvent("contact_submission_failed", { errorType: "network" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <label htmlFor="contact-name">Name</label>
      <input
        id="contact-name"
        name="name"
        value={values.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />

      <label htmlFor="contact-email">Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
        required
      />

      <label htmlFor="contact-subject">Subject</label>
      <input
        id="contact-subject"
        name="subject"
        value={values.subject}
        onChange={(event) => updateField("subject", event.target.value)}
        required
      />

      <label htmlFor="contact-message">Message</label>
      <textarea
        id="contact-message"
        name="message"
        rows={6}
        value={values.message}
        onChange={(event) => updateField("message", event.target.value)}
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Send Message"}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
      {error ? <p className="form-status form-status-error">{error}</p> : null}
    </form>
  );
}

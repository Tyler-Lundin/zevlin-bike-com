"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "../../lib/analytics";

type NewsletterSignupFormProps = {
  source?: string;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `landing-newsletter-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function NewsletterSignupForm({
  source = "landing-home",
  placeholder = "Your email address",
  submitLabel = "Subscribe Now",
  className = "newsletter-form",
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/newsletter/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": createIdempotencyKey(),
        },
        body: JSON.stringify({ email, source }),
      });

      const payload = (await response.json()) as { message?: string; status?: string; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to subscribe right now.");
        trackEvent("newsletter_signup_failed", { httpStatus: response.status });
        return;
      }

      setMessage(payload.message ?? "Thanks for signing up!");
      setEmail("");
      trackEvent("newsletter_signup_submitted", {
        intakeStatus: payload.status ?? "unknown",
        source,
      });
    } catch {
      setError("Network error. Please try again.");
      trackEvent("newsletter_signup_failed", { errorType: "network" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder={placeholder}
        aria-label="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : submitLabel}
      </button>
      {message ? <p className="form-status">{message}</p> : null}
      {error ? <p className="form-status form-status-error">{error}</p> : null}
    </form>
  );
}

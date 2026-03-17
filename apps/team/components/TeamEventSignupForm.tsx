"use client";

import { useState, type FormEvent } from "react";

type TeamEventOption = {
  id: string;
  label: string;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function TeamEventSignupForm({ events }: { events: TeamEventOption[] }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionState({ status: "idle" });

    try {
      const response = await fetch("/api/events/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          fullName,
          email,
          phone: phone || undefined,
          message: message || undefined,
        }),
      });

      if (!response.ok) {
        setSubmissionState({
          status: "error",
          message:
            response.status === 429 ? "Too many attempts. Please wait a few minutes." : "Could not submit your signup right now.",
        });
        return;
      }

      setSubmissionState({
        status: "success",
        message: "Signup received. The team will follow up directly.",
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setSubmissionState({
        status: "error",
        message: "Network error. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="team-signup-form" onSubmit={handleSubmit}>
      <div className="team-form-intro">
        <p className="team-section-kicker team-section-kicker-tight">Join request</p>
        <h3>Send one clean signup request.</h3>
        <p>The team follows up directly with details, questions, or route updates.</p>
      </div>

      <div className="team-form-grid">
        <label className="team-field">
          <span>Session</span>
          <select value={eventId} onChange={(event) => setEventId(event.target.value)} required>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.label}
              </option>
            ))}
          </select>
        </label>

        <label className="team-field">
          <span>Full name</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            minLength={2}
            autoComplete="name"
            required
          />
        </label>

        <label className="team-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>

        <label className="team-field">
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            placeholder="Optional"
          />
        </label>
      </div>

      <label className="team-field">
        <span>Message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Anything the team should know before following up?"
        />
      </label>

      <button className="team-button-primary" type="submit" disabled={isSubmitting || !events.length}>
        {isSubmitting ? "Submitting..." : "Send signup request"}
      </button>

      {submissionState.status !== "idle" ? (
        <p className={`team-form-status team-form-status-${submissionState.status}`}>{submissionState.message}</p>
      ) : null}
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";

type SubmissionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const businessTypes = [
  { value: "bike_shop", label: "Bike shop" },
  { value: "retailer", label: "Retailer" },
  { value: "distributor", label: "Distributor" },
  { value: "team_or_club", label: "Team or club" },
  { value: "event_or_community", label: "Event or community" },
  { value: "other", label: "Other" },
] as const;

const inquiryTypes = [
  { value: "wholesale", label: "Wholesale" },
  { value: "retail_placement", label: "Retail placement" },
  { value: "community_partnership", label: "Community partnership" },
  { value: "event_support", label: "Event support" },
  { value: "team_support", label: "Team support" },
  { value: "other", label: "Other" },
] as const;

export default function B2bInquiryForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionState({ status: "idle" });

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          contactName,
          contactEmail,
          contactPhone,
          businessType,
          location,
          inquiryType,
          website: website || undefined,
          taxId: taxId || undefined,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        setSubmissionState({
          status: "error",
          message: response.status === 429 ? "Too many attempts. Please wait and try again." : "Could not submit the inquiry right now.",
        });
        return;
      }

      setSubmissionState({
        status: "success",
        message: "Inquiry received. Zevlin will review it and follow up directly.",
      });
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setBusinessType("");
      setLocation("");
      setInquiryType("");
      setWebsite("");
      setTaxId("");
      setNotes("");
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
    <form className="b2b-form" onSubmit={handleSubmit}>
      <div className="b2b-form-grid">
        <label className="b2b-field">
          <span>Company name</span>
          <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} minLength={2} required />
        </label>

        <label className="b2b-field">
          <span>Contact name</span>
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} minLength={2} required />
        </label>

        <label className="b2b-field">
          <span>Email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="b2b-field">
          <span>Phone</span>
          <input
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            autoComplete="tel"
            minLength={7}
            required
          />
        </label>

        <label className="b2b-field">
          <span>Business type</span>
          <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} required>
            <option value="">Select one</option>
            {businessTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="b2b-field">
          <span>Location</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, state / region"
            required
          />
        </label>

        <label className="b2b-field">
          <span>Inquiry type</span>
          <select value={inquiryType} onChange={(event) => setInquiryType(event.target.value)} required>
            <option value="">Select one</option>
            {inquiryTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="b2b-field">
          <span>Website</span>
          <input
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
          />
        </label>

        <label className="b2b-field b2b-field-wide">
          <span>Tax ID / resale ID</span>
          <input
            value={taxId}
            onChange={(event) => setTaxId(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="b2b-field b2b-field-wide">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Tell Zevlin what you are evaluating and what kind of follow-up makes sense."
          />
        </label>
      </div>

      <button className="b2b-button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit inquiry"}
      </button>

      {submissionState.status !== "idle" ? (
        <p className={`b2b-form-status b2b-form-status-${submissionState.status}`}>{submissionState.message}</p>
      ) : null}
    </form>
  );
}

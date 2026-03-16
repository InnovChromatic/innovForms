/**
 * =============================================================================
 * Admin — Response Detail (Light Theme, Font Awesome)
 * =============================================================================
 * Shows all submitted data organized by form sections with proper value rendering.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faClock,
  faCircleInfo,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import type { FormSchema } from "@/types";

/**
 * Renders a submission value properly, handling arrays, objects, and primitives.
 */
function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default async function ResponseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, forms ( title, schema )")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const formData = submission.forms as unknown as { title: string; schema: FormSchema } | null;
  const submissionData = (submission.data as Record<string, unknown>) || {};
  const sections = formData?.schema?.sections || [];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <Link href="/admin/responses" className="btn btn-ghost btn-sm mb-md">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Responses
        </Link>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Response Detail</h1>
          <p>{formData?.title || "Unknown Form"}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Render each section and its fields */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="card" style={{ padding: "var(--space-lg)" }}>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)", color: "var(--text-primary)" }}>
                {section.title || "Untitled Section"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {section.fields.map((field) => (
                  <div key={field.id} style={{ padding: "var(--space-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)", marginBottom: 6 }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {renderValue(submissionData[field.id])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Fallback: flat list of all key-value pairs */
          <div className="card" style={{ padding: "var(--space-lg)" }}>
            <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>Submitted Data</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {Object.entries(submissionData).map(([key, value]) => (
                <div key={key} style={{ padding: "var(--space-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)", marginBottom: 6 }}>
                    {key}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {renderValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Card */}
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>Metadata</h3>

          <div style={{ padding: "var(--space-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>Status</div>
            <span className={`badge badge-${submission.status === "submitted" ? "info" : submission.status === "approved" ? "success" : submission.status === "reviewed" ? "warning" : "error"}`}>
              {submission.status}
            </span>
          </div>

          <div style={{ padding: "var(--space-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} /> Submitted At
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
              {new Date(submission.submitted_at).toLocaleString()}
            </div>
          </div>

          {submission.user_id && (
            <div style={{ padding: "var(--space-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: 4 }} /> User ID
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                {submission.user_id}
              </div>
            </div>
          )}

          <div style={{ padding: "var(--space-sm) 0" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ marginRight: 4 }} /> Submission ID
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
              {submission.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

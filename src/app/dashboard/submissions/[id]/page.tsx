/**
 * =============================================================================
 * User — Submission Detail (Light Theme, Font Awesome)
 * =============================================================================
 * Displays the user's submitted data organized by form sections.
 * Properly handles arrays (checkboxes), objects, and all primitive types.
 */

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faClock,
  faCircleInfo,
  faEdit,
  faPaperclip
} from "@fortawesome/free-solid-svg-icons";
import type { FormSchema, FormSettings } from "@/types";
import ParsedText from "@/components/ui/ParsedText";

/**
 * Renders a submission value properly, handling arrays, objects, and primitives.
 */
function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: submission } = await adminSupabase
    .from("submissions")
    .select("*, forms ( title, description, schema, settings )")
    .eq("id", id)
    .eq("user_id", user?.id || "")
    .single();

  if (!submission) notFound();

  const formData = submission.forms as unknown as { title: string; description?: string; schema: FormSchema; settings: FormSettings } | null;
  const submissionData = (submission.data as Record<string, unknown>) || {};
  const sections = formData?.schema?.sections || [];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <Link href="/dashboard/submissions" className="btn btn-ghost btn-sm mb-md">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Submissions
        </Link>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 0,
          flexWrap: "wrap",
          gap: "var(--space-md)"
        }}>
          <div>
            <h1 style={{ marginBottom: "var(--space-xs)" }}>Submission Detail</h1>
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formData?.title || "Unknown Form"}</p>
            {formData?.description && (
              <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)", marginTop: "var(--space-xs)" }}>
                <ParsedText text={formData.description} />
              </p>
            )}
            
            {formData?.settings?.attachedFileUrl && (
              <div style={{ marginTop: "var(--space-md)" }}>
                <a 
                  href={formData.settings.attachedFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-sm)" }}
                >
                  <FontAwesomeIcon icon={faPaperclip} />
                  View Attached Document
                </a>
              </div>
            )}
          </div>

          {formData?.settings?.allowEdit && (
            <Link href={`/forms/${submission.form_id}`} className="btn btn-primary">
              <FontAwesomeIcon icon={faEdit} /> Edit Submission
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Render each section and its fields */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="card" style={{ padding: "var(--space-lg)" }}>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)", color: "var(--text-primary)" }}>
                {section.title || "Your Response"}
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
            <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>Your Response</h3>
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
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>Details</h3>

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

          <div style={{ padding: "var(--space-sm) 0" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 4 }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ marginRight: 4 }} /> ID
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

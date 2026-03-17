/**
 * =============================================================================
 * User Dashboard — Light Theme with Font Awesome & Material Stats
 * =============================================================================
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faFileLines,
  faClock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import ParsedText from "@/components/ui/ParsedText";

export default async function DashboardPage() {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  /* Fetch user's submissions */
  const { data: submissions, count: totalSubmissions } = await adminSupabase
    .from("submissions")
    .select("id, form_id, status, submitted_at, forms ( title )", { count: "exact" })
    .eq("user_id", user?.id || "")
    .order("submitted_at", { ascending: false })
    .limit(5);

  /* Fetch available forms */
  const { data: availableForms } = await adminSupabase
    .from("forms")
    .select("id, title, description")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Track your submissions and fill out available forms</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "var(--space-2xl)" }}>
        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-blue)" }}>
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Submissions</div>
            <div className="stat-card-value">{totalSubmissions || 0}</div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} /> <span>All time</span>
          </div>
        </div>

        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-green)" }}>
            <FontAwesomeIcon icon={faFileLines} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Available Forms</div>
            <div className="stat-card-value">{availableForms?.length || 0}</div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} /> <span>Ready to fill</span>
          </div>
        </div>

        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-orange)" }}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Last Submission</div>
            <div className="stat-card-value" style={{ fontSize: "var(--text-lg)" }}>
              {submissions?.[0] ? new Date(submissions[0].submitted_at).toLocaleDateString() : "—"}
            </div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} /> <span>Most recent</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Submissions */}
        <div className="card truncate-text" style={{ padding: "var(--space-lg)" }}>
          <div className="flex items-center justify-between mb-lg">
            <h3 style={{ fontSize: "var(--text-base)" }}>Recent Submissions</h3>
            <Link href="/dashboard/submissions" className="btn btn-ghost btn-sm">
              View All <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>

          {submissions && submissions.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/dashboard/submissions/${sub.id}`}
                  style={{
                    display: "block",
                    padding: "var(--space-md)",
                    background: "var(--color-gray-50)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div style={{ flex: 1, minWidth: 0, marginRight: "var(--space-md)" }}>
                      <div className="truncate-text" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, fontSize: "var(--text-sm)" }}>
                        {(sub.forms as unknown as { title: string } | null)?.title || "Unknown Form"}
                      </div>
                      <div className="truncate-text" style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    {/* <span className={`badge badge-${sub.status === "submitted" ? "info" : sub.status === "approved" ? "success" : sub.status === "reviewed" ? "warning" : "error"}`}>
                      {sub.status}
                    </span> */}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
              <p>No submissions yet. Fill out a form to get started!</p>
            </div>
          )}
        </div>

        {/* Available Forms */}
        <div className="card truncate-text" style={{ padding: "var(--space-lg)" }}>
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>Available Forms</h3>

          {availableForms && availableForms.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {availableForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  style={{
                    display: "block",
                    padding: "var(--space-md)",
                    background: "var(--color-gray-50)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                >
                  <div className="truncate-text" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, fontSize: "var(--text-sm)" }}>
                    {form.title}
                  </div>
                  {form.description && (
                     <div className="truncate-text" style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      <ParsedText text={form.description} />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
              <p>No forms available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

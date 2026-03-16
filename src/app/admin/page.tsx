/**
 * =============================================================================
 * Admin Dashboard — Light Theme with Font Awesome & Material Stats
 * =============================================================================
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faInbox,
  faCalendarDay,
  faChartLine,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  /* Fetch analytics data */
  const { count: totalForms } = await adminSupabase
    .from("forms")
    .select("*", { count: "exact", head: true });

  const { count: totalSubmissions } = await adminSupabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todaySubmissions } = await adminSupabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("submitted_at", today.toISOString());

  const { data: recentSubmissions } = await adminSupabase
    .from("submissions")
    .select(`id, status, submitted_at, form_id, forms ( title )`)
    .order("submitted_at", { ascending: false })
    .limit(10);

  const { data: forms } = await adminSupabase
    .from("forms")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your forms and submissions</p>
      </div>

      {/* ---- Stat Cards (Material Style) ---- */}
      <div className="grid-4" style={{ marginBottom: "var(--space-2xl)" }}>
        {/* Total Forms */}
        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-blue)" }}>
            <FontAwesomeIcon icon={faFileLines} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Forms</div>
            <div className="stat-card-value">{totalForms || 0}</div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} />
            <span>All time</span>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-green)" }}>
            <FontAwesomeIcon icon={faInbox} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Submissions</div>
            <div className="stat-card-value">{totalSubmissions || 0}</div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} />
            <span>All time</span>
          </div>
        </div>

        {/* Today */}
        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-orange)" }}>
            <FontAwesomeIcon icon={faCalendarDay} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Today</div>
            <div className="stat-card-value">{todaySubmissions || 0}</div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} />
            <span>Since midnight</span>
          </div>
        </div>

        {/* Rate */}
        <div className="stat-card stagger-item">
          <div className="stat-card-icon" style={{ background: "var(--gradient-red)" }}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-card-body">
            <div className="stat-card-label">Avg / Form</div>
            <div className="stat-card-value">
              {totalSubmissions && totalForms
                ? Math.round(totalSubmissions / Math.max(totalForms, 1))
                : 0}
            </div>
          </div>
          <div className="stat-card-footer">
            <FontAwesomeIcon icon={faClock} />
            <span>Submissions per form</span>
          </div>
        </div>
      </div>

      {/* ---- Two Column: Recent + Forms ---- */}
      <div className="grid-2">
        {/* Recent Submissions */}
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <h3 style={{ marginBottom: "var(--space-lg)", fontSize: "var(--text-base)" }}>Recent Submissions</h3>

          {recentSubmissions && recentSubmissions.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Form</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {(sub.forms as unknown as { title: string } | null)?.title || "Unknown"}
                    </td>
                    <td>
                      <span className={`badge badge-${
                        sub.status === "submitted" ? "info" :
                        sub.status === "approved" ? "success" :
                        sub.status === "reviewed" ? "warning" : "error"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
              <p>No submissions yet</p>
            </div>
          )}
        </div>

        {/* Forms Overview */}
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <h3 style={{ marginBottom: "var(--space-lg)", fontSize: "var(--text-base)" }}>Your Forms</h3>

          {forms && forms.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {form.title}
                    </td>
                    <td>
                      <span className={`badge badge-${
                        form.status === "published" ? "success" :
                        form.status === "draft" ? "warning" : "error"
                      }`}>
                        {form.status}
                      </span>
                    </td>
                    <td>{new Date(form.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
              <p>No forms created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

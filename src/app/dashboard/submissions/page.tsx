/**
 * =============================================================================
 * User — Submissions List (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faClipboardList,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface Submission {
  id: string;
  form_id: string;
  status: string;
  submitted_at: string;
  forms: { title: string } | null;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("submissions")
        .select("id, form_id, status, submitted_at, forms ( title )")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      setSubmissions((data as unknown as Submission[]) || []);
      setLoading(false);
    };
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) =>
    ((s.forms as unknown as { title: string } | null)?.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /><p>Loading submissions...</p></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>My Submissions</h1>
        <p>View all your form submissions</p>
      </div>

      {/* Search */}
      <div className="search-bar mb-xl">
        <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
        <input placeholder="Search submissions..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-sm truncate-text">
          {filtered.map((sub) => (
            <Link
              key={sub.id}
              href={`/dashboard/submissions/${sub.id}`}
              style={{
                display: "block",
                padding: "var(--space-lg)",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
            >
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0, marginRight: "var(--space-md)" }}>
                  <div className="truncate-text" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, fontSize: "var(--text-base)" }}>
                    {(sub.forms as unknown as { title: string } | null)?.title || "Unknown Form"}
                  </div>
                  <div className="truncate-text" style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--accent-primary)", fontWeight: 600 }}>
                    View <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 2 }} />
                  </div>
                {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                  <span className={`badge badge-${sub.status === "submitted" ? "info" : sub.status === "approved" ? "success" : sub.status === "reviewed" ? "warning" : "error"}`}>
                    {sub.status}
                  </span>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--accent-primary)", fontWeight: 600 }}>
                    View <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 2 }} />
                  </div>
                </div> */}
       </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>
            <h3>No submissions found</h3>
            <p>Fill out a form and your submissions will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}

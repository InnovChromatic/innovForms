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
  faEye,
  faClipboardList,
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
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Form</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {(sub.forms as unknown as { title: string } | null)?.title || "Unknown"}
                  </td>
                  <td>
                    <span className={`badge badge-${sub.status === "submitted" ? "info" : sub.status === "approved" ? "success" : sub.status === "reviewed" ? "warning" : "error"}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/dashboard/submissions/${sub.id}`} className="btn btn-ghost btn-sm">
                      <FontAwesomeIcon icon={faEye} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

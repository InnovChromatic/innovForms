/**
 * =============================================================================
 * Admin — Excel-Like Form Responses (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileExport,
  faEye,
  faArrowLeft,
  faInbox,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";
import type { FormSchema } from "@/types";

interface Submission {
  id: string;
  status: string;
  submitted_at: string;
  data: Record<string, unknown>;
}

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const [form, setForm] = useState<{ title: string; schema: FormSchema } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: formData } = await supabase.from("forms").select("title, schema").eq("id", formId).single();
      if (formData) {
        setForm({ title: formData.title, schema: formData.schema as FormSchema });
      }

      const { data: subsData } = await supabase
        .from("submissions")
        .select("id, status, submitted_at, data")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });
        
      setSubmissions((subsData as unknown as Submission[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [formId]);

  /* Generate dynamic columns based on form schema */
  const fields = form?.schema?.sections?.flatMap(s => s.fields) || [];
  // Keep only inputs that have a label
  const dataColumns = fields.filter(f => f.label);

  const filtered = submissions.filter((s) =>
    JSON.stringify(s.data).toLowerCase().includes(search.toLowerCase()) ||
    s.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedSubmissions = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* Export CSV with specific columns */
  const exportCSV = () => {
    const rows = filtered.map((s) => {
      const rowData: Record<string, unknown> = {
        Submission_ID: s.id,
        Status: s.status,
        Date: new Date(s.submitted_at).toLocaleString(),
      };
      
      dataColumns.forEach(col => {
        let val = s.data[col.id];
        if (Array.isArray(val)) val = val.join(", ");
        rowData[col.label] = val || "";
      });
      
      return rowData;
    });
    
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.title || "Form"}_Responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /><p>Loading responses...</p></div>;

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: "var(--space-md)" }}>
        <Link href="/admin/responses" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Forms
        </Link>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{form?.title} — Responses</h1>
          <p>View and manage submissions for this form</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV} disabled={filtered.length === 0}>
          <FontAwesomeIcon icon={faFileExport} /> Export CSV
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center mb-md flex-wrap gap-md">
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
          <input 
            placeholder="Search responses data..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Showing {filtered.length} response{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Excel-like Table */}
      {filtered.length > 0 ? (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table" style={{ whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th style={{ width: 150 }}>Submitted</th>
                {dataColumns.map(col => (
                  <th key={col.id} className="truncate-text" style={{ maxWidth: 200 }} title={col.label}>{col.label}</th>
                ))}
                <th style={{ width: 100 }}>Status</th>
                <th style={{ position: "sticky", right: 0, background: "var(--bg-card)", boxShadow: "-2px 0 5px rgba(0,0,0,0.05)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                  {dataColumns.map(col => {
                    let val = sub.data[col.id];
                    if (Array.isArray(val)) val = val.join(", ");
                    return (
                      <td key={col.id} className="truncate-text" style={{ maxWidth: 300 }} title={String(val || "")}>
                        {val ? String(val) : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                      </td>
                    );
                  })}
                  <td>
                    <span className={`badge badge-${sub.status === "submitted" ? "info" : sub.status === "approved" ? "success" : sub.status === "reviewed" ? "warning" : "error"}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ position: "sticky", right: 0, background: "var(--bg-card)", boxShadow: "-2px 0 5px rgba(0,0,0,0.05)" }}>
                    <Link href={`/admin/responses/${sub.id}`} className="btn btn-ghost btn-sm">
                      <FontAwesomeIcon icon={faEye} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ padding: "var(--space-md)", borderTop: "1px solid var(--border-light)", marginTop: 0 }}>
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <div style={{ fontSize: "var(--text-sm)", margin: "0 var(--space-md)" }}>
                Page <span style={{ fontWeight: 600 }}>{currentPage}</span> of {totalPages}
              </div>
              <button 
                className="pagination-btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={faInbox} />
            </div>
            <h3>No responses found</h3>
            <p>{search ? "Try adjusting your search query" : "This form hasn't received any responses yet"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

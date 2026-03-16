/**
 * =============================================================================
 * Admin — Forms List for Responses (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTable, faInbox } from "@fortawesome/free-solid-svg-icons";

interface FormOption {
  id: string;
  title: string;
  status: string;
  created_at: string;
  response_count: number;
}

export default function ResponsesIndexPage() {
  const [forms, setForms] = useState<FormOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch all forms
      const { data: formsData } = await supabase
        .from("forms")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });
      
      // Fetch summary of submissions count per form
      // An easy way client-side is to just fetch form_ids and aggregate them
      const { data: subsData } = await supabase.from("submissions").select("form_id");
      
      const countMap: Record<string, number> = {};
      if (subsData) {
        subsData.forEach((s) => {
          countMap[s.form_id] = (countMap[s.form_id] || 0) + 1;
        });
      }

      if (formsData) {
        setForms(formsData.map(f => ({
          ...f,
          response_count: countMap[f.id] || 0
        })));
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /><p>Loading forms...</p></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Responses</h1>
        <p>Select a form to view its responses and data</p>
      </div>

      <div className="search-bar mb-lg" style={{ maxWidth: 400 }}>
        <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
        <input 
          placeholder="Search forms by title..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="grid-3">
        {filtered.length > 0 ? (
          filtered.map((form) => (
            <div key={form.id} className="card stagger-item flex flex-col justify-between" style={{ padding: "var(--space-md)", gap: "var(--space-md)" }}>
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <h3 className="line-clamp-2" style={{ fontSize: "var(--text-base)", color: "var(--text-primary)" }}>
                    {form.title}
                  </h3>
                  <span className={`badge badge-${form.status === "published" ? "success" : form.status === "draft" ? "warning" : "error"}`} style={{ flexShrink: 0 }}>
                    {form.status}
                  </span>
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  <FontAwesomeIcon icon={faInbox} style={{ marginRight: 6 }} />
                  {form.response_count} response{form.response_count !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-xs)" }}>
                  Created {new Date(form.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <Link href={`/admin/responses/form/${form.id}`} className="btn btn-secondary w-full" style={{ width: "100%" }}>
                <FontAwesomeIcon icon={faTable} /> View Data Table
              </Link>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <h3>No forms found</h3>
            <p>Try a different search term or go to Forms to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

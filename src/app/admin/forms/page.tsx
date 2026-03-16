/**
 * =============================================================================
 * Admin — Forms Management Page (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faPen,
  faTrash,
  faCopy,
  faToggleOn,
  faToggleOff,
  faLink,
  faFileLines,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../admin.module.css";

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* Fetch forms */
  useEffect(() => {
    const fetchForms = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("forms")
        .select("id, title, description, status, created_at")
        .order("created_at", { ascending: false });
      setForms(data || []);
      setLoading(false);
    };
    fetchForms();
  }, []);

  /* Delete form */
  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    const supabase = createClient();
    await supabase.from("forms").delete().eq("id", id);
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  /* Toggle status */
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const supabase = createClient();
    await supabase.from("forms").update({ status: newStatus }).eq("id", id);
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
  };

  /* Duplicate form */
  const duplicateForm = async (form: FormRow) => {
    const supabase = createClient();
    const { data: original } = await supabase
      .from("forms")
      .select("*")
      .eq("id", form.id)
      .single();
    if (!original) return;

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("forms").insert({
      title: `${original.title} (Copy)`,
      description: original.description,
      schema: original.schema,
      settings: original.settings,
      status: "draft",
      created_by: user?.id,
    });
    router.refresh();
    window.location.reload();
  };

  /* Filter */
  const filtered = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" />
        <p>Loading forms...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Forms</h1>
          <p>Manage and organize your forms</p>
        </div>
        <Link href="/admin/forms/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} />
          Create Form
        </Link>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: "var(--space-xl)" }}>
        <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
        <input
          placeholder="Search forms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map((form) => (
            <div key={form.id} className={styles.formCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className={styles.formCardTitle}>{form.title}</div>
                <span className={`badge badge-${form.status === "published" ? "success" : form.status === "draft" ? "warning" : "error"}`}>
                  {form.status}
                </span>
              </div>
              <div className={styles.formCardDesc}>
                {form.description || "No description"}
              </div>
              <div className={styles.formCardMeta}>
                <FontAwesomeIcon icon={faClock} />
                <span>{new Date(form.created_at).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className={styles.formCardActions}>
                <Link href={`/admin/forms/${form.id}/edit`} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faPen} /> Edit
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(form.id, form.status)}>
                  <FontAwesomeIcon icon={form.status === "published" ? faToggleOn : faToggleOff} />
                  {form.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => duplicateForm(form)}>
                  <FontAwesomeIcon icon={faCopy} /> Copy
                </button>
                {form.status === "published" && (
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}`)}>
                    <FontAwesomeIcon icon={faLink} /> Link
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => deleteForm(form.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={faFileLines} />
            </div>
            <h3>No forms found</h3>
            <p>Create your first form to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}

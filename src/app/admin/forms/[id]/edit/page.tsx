/**
 * =============================================================================
 * Admin — Edit Form (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { FormField, FormSection, FormSchema, FormSettings, FieldType } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faTrash, faChevronUp, faChevronDown, faLink, faSpinner,
  faFont, faEnvelope, faPhone, faAlignLeft, faCaretDown,
  faCircleDot, faSquareCheck, faPaperclip, faCalendarDays, faStar, faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../admin.module.css";

const FIELD_TYPES: { type: FieldType; label: string; icon: typeof faFont }[] = [
  { type: "text", label: "Text Input", icon: faFont },
  { type: "email", label: "Email", icon: faEnvelope },
  { type: "phone", label: "Phone", icon: faPhone },
  { type: "textarea", label: "Textarea", icon: faAlignLeft },
  { type: "dropdown", label: "Dropdown", icon: faCaretDown },
  { type: "radio", label: "Radio", icon: faCircleDot },
  { type: "checkbox", label: "Checkbox", icon: faSquareCheck },
  { type: "file", label: "File Upload", icon: faPaperclip },
  { type: "date", label: "Date", icon: faCalendarDays },
  { type: "rating", label: "Rating", icon: faStar },
  { type: "number", label: "Number", icon: faHashtag },
];

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState<FormSettings>({ multiStep: false, allowEdit: false, requireAuth: false, showProgressBar: true, limitOnePerUser: false });
  const [sections, setSections] = useState<FormSection[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const router = useRouter();

  /* Load form data */
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("forms").select("*").eq("id", id).single();
      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        setSettings(data.settings as FormSettings);
        setSections((data.schema as FormSchema).sections || []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const addField = (sectionIndex: number, type: FieldType) => {
    const newField: FormField = { id: uuidv4(), type, label: `New ${type} field`, placeholder: "", required: false };
    if (["dropdown", "radio", "checkbox"].includes(type)) newField.options = [{ label: "Option 1", value: "option-1" }, { label: "Option 2", value: "option-2" }];
    if (type === "rating") newField.properties = { maxRating: 5 };
    setSections((prev) => { const u = [...prev]; u[sectionIndex] = { ...u[sectionIndex], fields: [...u[sectionIndex].fields, newField] }; return u; });
    setSelectedFieldId(newField.id);
  };

  const removeField = (si: number, fId: string) => {
    setSections((prev) => { const u = [...prev]; u[si] = { ...u[si], fields: u[si].fields.filter((f) => f.id !== fId) }; return u; });
    if (selectedFieldId === fId) setSelectedFieldId(null);
  };

  const moveField = (si: number, fi: number, dir: "up" | "down") => {
    setSections((prev) => { const u = [...prev]; const f = [...u[si].fields]; const t = dir === "up" ? fi - 1 : fi + 1; if (t < 0 || t >= f.length) return prev; [f[fi], f[t]] = [f[t], f[fi]]; u[si] = { ...u[si], fields: f }; return u; });
  };

  const updateField = (si: number, fId: string, updates: Partial<FormField>) => {
    setSections((prev) => { const u = [...prev]; u[si] = { ...u[si], fields: u[si].fields.map((f) => f.id === fId ? { ...f, ...updates } : f) }; return u; });
  };

  const addSection = () => {
    setSections((prev) => [...prev, { id: uuidv4(), title: `Section ${prev.length + 1}`, fields: [] }]);
    setActiveSectionIndex(sections.length);
  };
  const removeSection = (i: number) => { if (sections.length <= 1) return; setSections((prev) => prev.filter((_, idx) => idx !== i)); };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) { setError("Please enter a form title."); return; }
    setError(""); setSaving(true);
    try {
      const supabase = createClient();
      const schema: FormSchema = { sections };
      const { error: dbError } = await supabase.from("forms").update({ title: title.trim(), description: description.trim() || null, schema, settings, status }).eq("id", id);
      if (dbError) { setError(dbError.message); return; }
      router.push("/admin/forms"); router.refresh();
    } catch { setError("Failed to save."); } finally { setSaving(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /><p>Loading form...</p></div>;

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)", margin: "0 auto var(--space-xl)", maxWidth: "1000px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Edit Form</h1>
          <p>Modify your form fields and settings</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forms/${id}`)}>
            <FontAwesomeIcon icon={faLink} /> Copy Link
          </button>
          <button className="btn btn-secondary" onClick={() => handleSave("draft")} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary" onClick={() => handleSave("published")} disabled={saving}>
            {saving ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</> : "Publish"}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: "var(--space-md)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", margin: "0 auto var(--space-xl)", fontSize: "var(--text-sm)", maxWidth: "1000px" }}>{error}</div>}

      <div className={styles.builderContainer} style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Form Metadata */}
        <div className={styles.builderCanvas}>
          <div className="input-group">
            <label className="input-label">Form Title <span className="required">*</span></label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Description</label>
            <textarea className="input-field textarea-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, si) => (
          <div 
            key={section.id} 
            className={styles.builderCanvas}
            style={{ 
              marginBottom: "var(--space-lg)",
              border: activeSectionIndex === si ? "2px solid var(--accent-primary)" : "2px solid transparent",
              transition: "border 0.2s ease"
            }}
            onClick={() => setActiveSectionIndex(si)}
          >
            <div className="flex items-center justify-between mb-md">
              <input className="input-field" style={{ maxWidth: 300, fontWeight: 600 }} value={section.title} onChange={(e) => { const u = [...sections]; u[si] = { ...u[si], title: e.target.value }; setSections(u); }} />
              {sections.length > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={() => removeSection(si)} style={{ color: "var(--color-error)" }}>
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              )}
            </div>
            
            {section.fields.length > 0 ? section.fields.map((field, fi) => (
              <div key={field.id} className={`${styles.fieldItem} ${selectedFieldId === field.id ? styles.selected : ""}`}>
                
                {/* Field Header */}
                <div className={styles.fieldItemHeader} onClick={() => setSelectedFieldId(selectedFieldId === field.id ? null : field.id)}>
                  <div className={styles.fieldItemInfo}>
                    <span className={styles.fieldItemType}>{field.type}</span>
                    <span className={styles.fieldItemLabel}>{field.label}{field.required && <span style={{ color: "var(--color-error)" }}> *</span>}</span>
                  </div>
                  <div className={styles.fieldItemActions}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); moveField(si, fi, "up"); }} disabled={fi === 0}><FontAwesomeIcon icon={faChevronUp} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); moveField(si, fi, "down"); }} disabled={fi === section.fields.length - 1}><FontAwesomeIcon icon={faChevronDown} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); removeField(si, field.id); }} style={{ color: "var(--color-error)" }}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                </div>

                {/* Field Inline Editor */}
                {selectedFieldId === field.id && (
                  <div className={styles.fieldInlineEditor}>
                    <div className="grid-2 gap-sm" style={{ marginBottom: "var(--space-md)" }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Label</label>
                        <input className="input-field" value={field.label} onChange={(e) => updateField(si, field.id, { label: e.target.value })} />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Placeholder</label>
                        <input className="input-field" value={field.placeholder || ""} onChange={(e) => updateField(si, field.id, { placeholder: e.target.value })} />
                      </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: "var(--space-md)" }}>
                      <label className="input-label">Helper Text</label>
                      <input className="input-field" value={field.helperText || ""} onChange={(e) => updateField(si, field.id, { helperText: e.target.value })} />
                    </div>

                    <div className={styles.toggleWrap} style={{ padding: 0, marginBottom: "var(--space-md)", justifyContent: "flex-start", gap: "var(--space-sm)" }}>
                      <button className={`${styles.toggle} ${field.required ? styles.active : ""}`} onClick={() => updateField(si, field.id, { required: !field.required })} />
                      <span className={styles.toggleLabel}>Required Field</span>
                    </div>

                    {["dropdown", "radio", "checkbox"].includes(field.type) && (
                      <div style={{ marginTop: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px dashed var(--border-light)" }}>
                        <label className="input-label mb-sm">Options</label>
                        {(field.options || []).map((opt, oi) => (
                          <div key={oi} className="flex gap-sm mb-sm">
                            <input className="input-field" value={opt.label} onChange={(e) => { const n = [...(field.options || [])]; n[oi] = { ...n[oi], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "-") }; updateField(si, field.id, { options: n }); }} />
                            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateField(si, field.id, { options: (field.options || []).filter((_, i) => i !== oi) }); }} style={{ color: "var(--color-error)" }}><FontAwesomeIcon icon={faTrash} /></button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); updateField(si, field.id, { options: [...(field.options || []), { label: `Option ${(field.options?.length || 0) + 1}`, value: `option-${(field.options?.length || 0) + 1}` }] }); }}><FontAwesomeIcon icon={faPlus} /> Add Option</button>
                      </div>
                    )}

                    {/* File Upload Mime Types */}
                    {field.type === "file" && (
                      <div style={{ marginTop: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px dashed var(--border-light)" }}>
                        <label className="input-label mb-sm">Allowed File Types</label>
                        <input 
                          className="input-field" 
                          placeholder="e.g. .pdf, .jpg, .png (leave blank for any)"
                          value={(field.properties?.allowedMimeTypes as string) || ""}
                          onChange={(e) => updateField(si, field.id, { properties: { ...field.properties, allowedMimeTypes: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>No fields yet →</div>
            )}
          </div>
        ))}
        
        <button className="btn btn-secondary" onClick={addSection} style={{ width: "100%", padding: "var(--space-md)" }}>
          <FontAwesomeIcon icon={faPlus} /> Add Section
        </button>

        {/* Form Settings */}
        <div className={styles.builderCanvas}>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>Form Settings</h3>
          <div className="grid-2 gap-md">
            <div className={styles.toggleWrap} style={{ padding: "var(--space-sm)", background: "var(--color-gray-50)", borderRadius: "var(--radius-md)" }}>
              <span className={styles.toggleLabel} style={{ fontWeight: 600, color: "var(--text-primary)" }}>Multi-Step Form</span>
              <button className={`${styles.toggle} ${settings.multiStep ? styles.active : ""}`} onClick={() => setSettings({ ...settings, multiStep: !settings.multiStep })} />
            </div>
            <div className={styles.toggleWrap} style={{ padding: "var(--space-sm)", background: "var(--color-gray-50)", borderRadius: "var(--radius-md)" }}>
              <span className={styles.toggleLabel} style={{ fontWeight: 600, color: "var(--text-primary)" }}>Show Progress Bar</span>
              <button className={`${styles.toggle} ${settings.showProgressBar ? styles.active : ""}`} onClick={() => setSettings({ ...settings, showProgressBar: !settings.showProgressBar })} />
            </div>
            <div className={styles.toggleWrap} style={{ padding: "var(--space-sm)", background: "var(--color-gray-50)", borderRadius: "var(--radius-md)" }}>
              <span className={styles.toggleLabel} style={{ fontWeight: 600, color: "var(--text-primary)" }}>Require Login to Submit</span>
              <button className={`${styles.toggle} ${settings.requireAuth ? styles.active : ""}`} onClick={() => setSettings({ ...settings, requireAuth: !settings.requireAuth })} />
            </div>
            <div className={styles.toggleWrap} style={{ padding: "var(--space-sm)", background: "var(--color-gray-50)", borderRadius: "var(--radius-md)" }}>
              <span className={styles.toggleLabel} style={{ fontWeight: 600, color: "var(--text-primary)" }}>Allow Respondents to Edit</span>
              <button className={`${styles.toggle} ${settings.allowEdit ? styles.active : ""}`} onClick={() => setSettings({ ...settings, allowEdit: !settings.allowEdit })} />
            </div>
            <div className={styles.toggleWrap} style={{ padding: "var(--space-sm)", background: "var(--color-gray-50)", borderRadius: "var(--radius-md)" }}>
              <span className={styles.toggleLabel} style={{ fontWeight: 600, color: "var(--text-primary)" }}>Limit to 1 Response Per User</span>
              <button type="button" className={`${styles.toggle} ${settings.limitOnePerUser ? styles.active : ""}`} onClick={() => setSettings({ ...settings, limitOnePerUser: !settings.limitOnePerUser })} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className={`${styles.fabContainer} ${fabOpen ? styles.fabOpen : ""}`}>
        <div className={styles.fabMenu}>
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.type}
              className={styles.fabItem}
              onClick={() => { addField(activeSectionIndex, ft.type); setFabOpen(false); }}
            >
              <span className={styles.fabItemLabel}>{ft.label}</span>
              <div className={styles.fabItemIcon}>
                <FontAwesomeIcon icon={ft.icon} />
              </div>
            </button>
          ))}
        </div>
        <button
          className={`${styles.fabMain} ${fabOpen ? styles.fabOpen : ""}`}
          onClick={() => setFabOpen(!fabOpen)}
          title="Add Field"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}

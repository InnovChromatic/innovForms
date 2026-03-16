/**
 * =============================================================================
 * Admin — Create New Form (Light Theme, Font Awesome)
 * =============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { FormField, FormSection, FormSchema, FormSettings, FieldType } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faChevronUp,
  faChevronDown,
  faFont,
  faEnvelope,
  faPhone,
  faAlignLeft,
  faCaretDown,
  faCircleDot,
  faSquareCheck,
  faPaperclip,
  faCalendarDays,
  faStar,
  faHashtag,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../admin.module.css";

/* Field types with Font Awesome icons */
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

const DEFAULT_SETTINGS: FormSettings = {
  multiStep: false,
  allowEdit: false,
  requireAuth: false,
  showProgressBar: true,
  limitOnePerUser: false,
};

export default function CreateFormPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState<FormSettings>(DEFAULT_SETTINGS);
  const [sections, setSections] = useState<FormSection[]>([
    { id: uuidv4(), title: "Section 1", fields: [] },
  ]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const router = useRouter();

  /* Add field */
  const addField = (sectionIndex: number, type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `New ${type} field`,
      placeholder: "",
      required: false,
    };
    if (["dropdown", "radio", "checkbox"].includes(type)) {
      newField.options = [
        { label: "Option 1", value: "option-1" },
        { label: "Option 2", value: "option-2" },
      ];
    }
    if (type === "rating") {
      newField.properties = { maxRating: 5 };
    }
    setSections((prev) => {
      const updated = [...prev];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        fields: [...updated[sectionIndex].fields, newField],
      };
      return updated;
    });
    setSelectedFieldId(newField.id);
  };

  /* Remove field */
  const removeField = (sectionIndex: number, fieldId: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        fields: updated[sectionIndex].fields.filter((f) => f.id !== fieldId),
      };
      return updated;
    });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  /* Move field */
  const moveField = (sectionIndex: number, fieldIndex: number, direction: "up" | "down") => {
    setSections((prev) => {
      const updated = [...prev];
      const fields = [...updated[sectionIndex].fields];
      const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
      if (targetIndex < 0 || targetIndex >= fields.length) return prev;
      [fields[fieldIndex], fields[targetIndex]] = [fields[targetIndex], fields[fieldIndex]];
      updated[sectionIndex] = { ...updated[sectionIndex], fields };
      return updated;
    });
  };

  /* Update field */
  const updateField = (sectionIndex: number, fieldId: string, updates: Partial<FormField>) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        fields: updated[sectionIndex].fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
      };
      return updated;
    });
  };

  /* Add section */
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: uuidv4(), title: `Section ${prev.length + 1}`, fields: [] },
    ]);
    setActiveSectionIndex(sections.length);
  };

  /* Remove section */
  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  /* Save */
  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) { setError("Please enter a form title."); return; }
    if (sections.every((s) => s.fields.length === 0)) { setError("Please add at least one field."); return; }
    setError("");
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const schema: FormSchema = { sections };
      const { error: dbError } = await supabase.from("forms").insert({
        title: title.trim(),
        description: description.trim() || null,
        schema, settings, status,
        created_by: user?.id,
      });
      if (dbError) { setError(dbError.message); return; }
      router.push("/admin/forms");
      router.refresh();
    } catch {
      setError("Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Create New Form</h1>
          <p>Build your form by adding fields and configuring options</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary" onClick={() => handleSave("draft")} disabled={saving}>
            Save as Draft
          </button>
          <button className="btn btn-primary" onClick={() => handleSave("published")} disabled={saving}>
            {saving ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</> : "Publish Form"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "var(--space-md)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-xl)", fontSize: "var(--text-sm)" }}>
          {error}
        </div>
      )}

      <div className={styles.builderContainer}>
        {/* Form Metadata */}
        <div className={styles.builderCanvas}>
          <div className="input-group">
            <label className="input-label">Form Title <span className="required">*</span></label>
            <input className="input-field" placeholder="Enter form title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Description</label>
            <textarea className="input-field textarea-field" placeholder="Describe what this form is for..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Sections & Fields */}
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
              <input className="input-field" style={{ maxWidth: 300, fontWeight: 600 }} value={section.title} onChange={(e) => { const u = [...sections]; u[si] = { ...u[si], title: e.target.value }; setSections(u); }} placeholder="Section title" />
              {sections.length > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={() => removeSection(si)} style={{ color: "var(--color-error)" }}>
                  <FontAwesomeIcon icon={faTrash} /> Remove Section
                </button>
              )}
            </div>

            {section.fields.length > 0 ? (
              section.fields.map((field, fi) => (
                <div key={field.id} className={`${styles.fieldItem} ${selectedFieldId === field.id ? styles.selected : ""}`}>
                  
                  {/* Field Header (Collapsible toggle) */}
                  <div className={styles.fieldItemHeader} onClick={() => setSelectedFieldId(selectedFieldId === field.id ? null : field.id)}>
                    <div className={styles.fieldItemInfo}>
                      <span className={styles.fieldItemType}>{field.type}</span>
                      <span className={styles.fieldItemLabel}>
                        {field.label}
                        {field.required && <span style={{ color: "var(--color-error)" }}> *</span>}
                      </span>
                    </div>
                    <div className={styles.fieldItemActions}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); moveField(si, fi, "up"); }} disabled={fi === 0}>
                        <FontAwesomeIcon icon={faChevronUp} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); moveField(si, fi, "down"); }} disabled={fi === section.fields.length - 1}>
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); removeField(si, field.id); }} style={{ color: "var(--color-error)" }}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
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

                      {/* Options editor */}
                      {["dropdown", "radio", "checkbox"].includes(field.type) && (
                        <div style={{ marginTop: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px dashed var(--border-light)" }}>
                          <label className="input-label mb-sm">Options</label>
                          {(field.options || []).map((opt, oi) => (
                            <div key={oi} className="flex gap-sm mb-sm">
                              <input className="input-field" value={opt.label} onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[oi] = { ...newOptions[oi], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "-") };
                                updateField(si, field.id, { options: newOptions });
                              }} placeholder={`Option ${oi + 1}`} />
                              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newOptions = (field.options || []).filter((_, i) => i !== oi);
                                updateField(si, field.id, { options: newOptions });
                              }} style={{ color: "var(--color-error)" }}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          ))}
                          <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => {
                            e.preventDefault();
                            const newOptions = [...(field.options || []), { label: `Option ${(field.options?.length || 0) + 1}`, value: `option-${(field.options?.length || 0) + 1}` }];
                            updateField(si, field.id, { options: newOptions });
                          }}>
                            <FontAwesomeIcon icon={faPlus} /> Add Option
                          </button>
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
              ))
            ) : (
              <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                No fields yet. Add fields using the button in the bottom right corner →
              </div>
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

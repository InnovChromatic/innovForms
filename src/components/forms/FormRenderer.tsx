/**
 * =============================================================================
 * FormRenderer — Universal Form Rendering Engine (Light Theme, Font Awesome)
 * =============================================================================
 * Supports: text, email, phone, textarea, dropdown, radio, checkbox,
 * file, date, rating, number. Multi-step, validation, conditionals.
 */

"use client";

import { useState, useCallback } from "react";
import type { FormSchema, FormField, FormSettings } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCircleCheck,
  faCloudArrowUp,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FormRenderer.module.css";

interface FormRendererProps {
  schema: FormSchema;
  settings: FormSettings;
  formId: string;
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export default function FormRenderer({ schema, settings, formId, initialData, onSubmit }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sections = schema.sections || [];
  const isMultiStep = settings.multiStep && sections.length > 1;
  const visibleSections = isMultiStep ? [sections[currentStep]] : sections;

  /* Update field value */
  const updateValue = useCallback((fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n; });
  }, []);

  /* Validate a single field */
  const validateField = (field: FormField): string | null => {
    const value = formData[field.id];
    if (field.required && (!value || (typeof value === "string" && !value.trim()))) {
      return `${field.label} is required`;
    }
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return "Please enter a valid email";
    }
    if (field.validation) {
      if (field.validation.minLength && String(value || "").length < field.validation.minLength) {
        return `Minimum ${field.validation.minLength} characters`;
      }
      if (field.validation.maxLength && String(value || "").length > field.validation.maxLength) {
        return `Maximum ${field.validation.maxLength} characters`;
      }
    }
    return null;
  };

  /* Validate current step */
  const validateStep = (): boolean => {
    const fields = visibleSections.flatMap((s) => s.fields);
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const err = validateField(f);
      if (err) newErrors[f.id] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Handle submit */
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch {
      setErrors({ _form: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  /* Next / prev step */
  const nextStep = () => { if (validateStep() && currentStep < sections.length - 1) setCurrentStep((s) => s + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep((s) => s - 1); };

  /* Render a single field */
  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const value = formData[field.id];

    return (
      <div key={field.id} className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          {field.label}
          {field.required && <span className={styles.fieldRequired}>*</span>}
        </label>

        {/* Text / Email / Phone / Number / Date */}
        {["text", "email", "phone", "number", "date"].includes(field.type) && (
          <input
            type={field.type === "phone" ? "tel" : field.type}
            className={`${styles.fieldInput} ${error ? styles.fieldError : ""}`}
            placeholder={field.placeholder}
            value={String(value || "")}
            onChange={(e) => updateValue(field.id, e.target.value)}
          />
        )}

        {/* Textarea */}
        {field.type === "textarea" && (
          <textarea
            className={`${styles.fieldInput} ${styles.fieldTextarea} ${error ? styles.fieldError : ""}`}
            placeholder={field.placeholder}
            value={String(value || "")}
            onChange={(e) => updateValue(field.id, e.target.value)}
            rows={4}
          />
        )}

        {/* Dropdown */}
        {field.type === "dropdown" && (
          <select
            className={`${styles.fieldInput} ${styles.fieldSelect} ${error ? styles.fieldError : ""}`}
            value={String(value || "")}
            onChange={(e) => updateValue(field.id, e.target.value)}
          >
            <option value="">{field.placeholder || "Select an option..."}</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {/* Radio */}
        {field.type === "radio" && (
          <div className={styles.optionGroup}>
            {(field.options || []).map((opt) => (
              <label key={opt.value} className={styles.optionItem}>
                <input
                  type="radio"
                  name={`${formId}-${field.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => updateValue(field.id, opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {field.type === "checkbox" && (
          <div className={styles.optionGroup}>
            {(field.options || []).map((opt) => {
              const checked = Array.isArray(value) && (value as string[]).includes(opt.value);
              return (
                <label key={opt.value} className={styles.optionItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const arr = Array.isArray(value) ? [...(value as string[])] : [];
                      if (checked) {
                        updateValue(field.id, arr.filter((v) => v !== opt.value));
                      } else {
                        updateValue(field.id, [...arr, opt.value]);
                      }
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Rating */}
        {field.type === "rating" && (
          <div className={styles.ratingGroup}>
            {Array.from({ length: (field.properties?.maxRating as number) || 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.ratingStar} ${(value as number) > i ? styles.filled : ""}`}
                onClick={() => updateValue(field.id, i + 1)}
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
            ))}
          </div>
        )}

        {/* File */}
        {field.type === "file" && (
          <div className={styles.fileInput} onClick={() => document.getElementById(`file-${field.id}`)?.click()}>
            <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: "1.5rem", color: "var(--accent-primary)", marginBottom: 4 }} />
            <div className={styles.fileInputText}>
              {value ? String(value) : "Click to upload a file"}
            </div>
            <input
              id={`file-${field.id}`}
              type="file"
              style={{ display: "none" }}
              accept={(field.properties?.allowedMimeTypes as string) || undefined}
              onChange={(e) => updateValue(field.id, e.target.files?.[0]?.name || "")}
            />
          </div>
        )}

        {/* Helper text */}
        {field.helperText && <div className={styles.fieldHelper}>{field.helperText}</div>}

        {/* Error */}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  };

  /* --- Success State --- */
  if (submitted) {
    return (
      <div className={styles.formRenderer}>
        <div className={`${styles.section} ${styles.successMessage}`}>
          <div className={styles.successIcon}>
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <h2>Thank You!</h2>
          <p>Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formRenderer}>
      {/* Progress */}
      {isMultiStep && settings.showProgressBar && (
        <div className={styles.progressContainer}>
          <div className={styles.progressSteps}>
            {sections.map((s, i) => (
              <div
                key={s.id}
                className={`${styles.progressStep} ${i === currentStep ? styles.active : ""} ${i < currentStep ? styles.completed : ""}`}
              >
                <span className={styles.stepNumber}>{i + 1}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Sections */}
      {visibleSections.map((section) => (
        <div key={section.id} className={styles.section}>
          {(!isMultiStep || sections.length > 1) && (
            <h3 className={styles.sectionTitle}>{section.title}</h3>
          )}
          {section.fields.map(renderField)}
        </div>
      ))}

      {/* Form error */}
      {errors._form && (
        <div style={{ padding: "var(--space-md)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-md)", fontSize: "var(--text-sm)" }}>
          {errors._form}
        </div>
      )}

      {/* Navigation */}
      <div className={styles.navButtons}>
        {isMultiStep && currentStep > 0 ? (
          <button className="btn btn-secondary" onClick={prevStep}>Previous</button>
        ) : <div />}

        {isMultiStep && currentStep < sections.length - 1 ? (
          <button className="btn btn-primary" onClick={nextStep}>Next</button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><FontAwesomeIcon icon={faSpinner} spin /> Submitting...</> : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}

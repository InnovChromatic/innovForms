/**
 * =============================================================================
 * InnovForms — TypeScript Type Definitions
 * =============================================================================
 * Central type definitions for the entire application.
 * These types mirror the database schema and extend it with frontend concerns.
 */

/* =============================================================================
 * USER & AUTH TYPES
 * ============================================================================= */

/** User roles in the system */
export type UserRole = "user" | "admin";

/** User profile — extends Supabase auth.users with app-specific fields */
export interface Profile {
  id: string;                  // References auth.users.id
  email: string;               // User's email address
  full_name: string;           // Display name
  role: UserRole;              // Access level
  avatar_url?: string;         // Optional profile picture URL
  created_at: string;          // ISO timestamp
  updated_at: string;          // ISO timestamp
}

/* =============================================================================
 * FORM TYPES
 * ============================================================================= */

/** Possible statuses for a form */
export type FormStatus = "draft" | "published" | "closed";

/** Main form entity — contains metadata and the complete schema */
export interface Form {
  id: string;                  // UUID primary key
  title: string;               // Form title
  description?: string;        // Optional description shown to users
  schema: FormSchema;          // JSON schema defining all fields and sections
  settings: FormSettings;      // Configuration options
  status: FormStatus;          // Current form state
  created_by: string;          // Admin who created the form
  created_at: string;          // ISO timestamp
  updated_at: string;          // ISO timestamp
  submission_count?: number;   // Computed count of submissions
}

/** Schema defining the structure of a form */
export interface FormSchema {
  sections: FormSection[];     // Ordered list of form sections
}

/** A section groups related fields together */
export interface FormSection {
  id: string;                  // Unique section identifier
  title: string;               // Section heading
  description?: string;        // Optional section description
  fields: FormField[];         // Fields within this section
}

/** All supported field types */
export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "file"
  | "date"
  | "rating"
  | "number";

/** Individual form field definition */
export interface FormField {
  id: string;                  // Unique field identifier
  type: FieldType;             // Input type
  label: string;               // Display label
  placeholder?: string;        // Placeholder text
  helperText?: string;         // Helper text shown below the field
  required: boolean;           // Whether the field is mandatory
  validation?: FieldValidation; // Validation rules
  options?: FieldOption[];     // Options for dropdown/radio/checkbox
  conditionalOn?: ConditionalRule; // Show/hide based on another field
  properties?: Record<string, unknown>; // Extra type-specific properties
}

/** Option for dropdown, radio, and checkbox fields */
export interface FieldOption {
  label: string;               // Display text
  value: string;               // Stored value
}

/** Validation rules for a field */
export interface FieldValidation {
  pattern?: string;            // Regex pattern
  patternMessage?: string;     // Custom error for pattern mismatch
  minLength?: number;          // Minimum character length
  maxLength?: number;          // Maximum character length
  min?: number;                // Minimum numeric value
  max?: number;                // Maximum numeric value
  maxFileSize?: number;        // Max file size in MB
  allowedFileTypes?: string[]; // Allowed MIME types
  maxRating?: number;          // Maximum rating scale value
}

/** Rule for conditionally showing a field */
export interface ConditionalRule {
  fieldId: string;             // The field this depends on
  operator: "equals" | "not_equals" | "contains" | "not_empty";
  value?: string;              // The value to compare against
}

/** Form-wide settings */
export interface FormSettings {
  multiStep: boolean;          // Enable multi-step navigation
  allowEdit: boolean;          // Let users edit after submission
  requireAuth: boolean;        // Require login to submit
  showProgressBar: boolean;    // Show step progress indicator
  successMessage?: string;     // Custom success message
  redirectUrl?: string;        // URL to redirect after success
  limitOnePerUser: boolean;    // One submission per user
  attachedFileUrl?: string;    // URL of an attached document file
}

/* =============================================================================
 * SUBMISSION TYPES
 * ============================================================================= */

/** Possible statuses for a submission */
export type SubmissionStatus = "submitted" | "reviewed" | "approved" | "rejected";

/** A completed form submission */
export interface Submission {
  id: string;                  // UUID primary key
  form_id: string;             // The form that was submitted
  user_id?: string;            // The user who submitted (null if anonymous)
  data: Record<string, unknown>; // Field values keyed by field ID
  status: SubmissionStatus;    // Current review status
  submitted_at: string;        // ISO timestamp
  updated_at: string;          // ISO timestamp
  form?: Form;                 // Joined form data (optional)
  user?: Profile;              // Joined user data (optional)
}

/* =============================================================================
 * ANALYTICS TYPES
 * ============================================================================= */

/** Summary analytics for the admin dashboard */
export interface AnalyticsSummary {
  totalForms: number;          // Total number of forms
  totalSubmissions: number;    // Total submissions across all forms
  todaySubmissions: number;    // Submissions made today
  completionRate: number;      // Percentage of started forms that were completed
}

/** Per-form submission breakdown */
export interface FormAnalytics {
  formId: string;
  formTitle: string;
  submissionCount: number;
  lastSubmission?: string;     // ISO timestamp of most recent submission
}

/* =============================================================================
 * UI HELPER TYPES
 * ============================================================================= */

/** Toast notification configuration */
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;           // Auto-dismiss after ms
}

/** Pagination state */
export interface PaginationState {
  page: number;                // Current page (1-indexed)
  pageSize: number;            // Items per page
  total: number;               // Total item count
}

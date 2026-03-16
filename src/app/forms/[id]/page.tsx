/**
 * =============================================================================
 * Public Form Page — Light Theme
 * =============================================================================
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import FormRenderer from "@/components/forms/FormRenderer";
import type { FormSchema, FormSettings } from "@/types";

export default async function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!form) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const settings = (form.settings as FormSettings) || {};

  /* Setting: Require Login */
  if (settings.requireAuth && !user) {
    return (
      <div className="page-loader" style={{ minHeight: "100vh", background: "var(--bg-body)" }}>
        <div className="card" style={{ maxWidth: 400, textAlign: "center", padding: "var(--space-2xl)" }}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: "3rem", color: "var(--accent-primary)", marginBottom: "var(--space-md)" }} />
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-md)" }}>Authentication Required</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-lg)" }}>
            Please log in to fill out this form.
          </p>
          <Link href={`/login`} className="btn btn-primary" style={{ width: "100%" }}>
            Log In to Continue
          </Link>
        </div>
      </div>
    );
  }

  /* Fetch existing submission if needed for limit/allowEdit */
  let existingSubmission: Record<string, any> | null = null;
  if (user && (settings.limitOnePerUser || settings.allowEdit)) {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("form_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
      
    existingSubmission = data;
  }

  /* Setting: Limit 1 Response Per User (and Not Editable) */
  if (existingSubmission && settings.limitOnePerUser && !settings.allowEdit) {
    return (
      <div className="page-loader" style={{ minHeight: "100vh", background: "var(--bg-body)" }}>
         <div className="card" style={{ maxWidth: 400, textAlign: "center", padding: "var(--space-2xl)" }}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: "3rem", color: "var(--color-warning)", marginBottom: "var(--space-md)" }} />
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-md)" }}>Already Submitted</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-lg)" }}>
            You have already submitted a response for this form and multiple responses are not allowed.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ width: "100%" }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* Server Action */
  async function handleSubmit(data: Record<string, unknown>) {
    "use server";
    const supabaseClient = await createClient();
    const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
    
    // Validate if user has an existing submission
    if (currentUser) {
      if (existingSubmission && settings.allowEdit) {
        // Update existing
        await supabaseClient.from("submissions").update({
          data,
          status: "submitted",
          submitted_at: new Date().toISOString()
        }).eq("id", existingSubmission.id);
        return;
      }
      
      if (existingSubmission && settings.limitOnePerUser && !settings.allowEdit) {
        throw new Error("You have already submitted this form.");
      }
    }

    // Insert new
    await supabaseClient.from("submissions").insert({
      form_id: id,
      user_id: currentUser?.id || null,
      data,
      status: "submitted",
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-body)",
      padding: "var(--space-2xl) var(--space-lg)",
    }}>
      {/* Form Header */}
      <div style={{
        maxWidth: "var(--form-max-width)",
        margin: "0 auto var(--space-xl)",
        textAlign: "center",
      }}>
        <Image src="/title_logo.jpg" alt="InnovForms Logo" width={48} height={48} style={{ borderRadius: "var(--radius-lg)", objectFit: "cover", marginBottom: "var(--space-md)" }} />
        <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-xs)" }}>{form.title}</h1>
        {form.description && (
          <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>{form.description}</p>
        )}
        
        {existingSubmission && settings.allowEdit && (
          <div className="badge badge-info" style={{ marginTop: "var(--space-sm)" }}>
            Editing Existing Submission
          </div>
        )}
      </div>

      {/* Form Renderer */}
      <FormRenderer
        schema={form.schema as FormSchema}
        settings={settings}
        formId={form.id}
        initialData={existingSubmission?.data as Record<string, unknown> | undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

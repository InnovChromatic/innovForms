/**
 * =============================================================================
 * File Upload API Route — Supabase Storage
 * =============================================================================
 * Handles file uploads from the FormRenderer component.
 * Uploads the file to the 'form-uploads' bucket in Supabase Storage
 * and returns the public URL of the uploaded file.
 *
 * POST /api/upload
 * Body: FormData with 'file' field and optional 'formId' field
 * Returns: { url: string } on success
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/** Bucket name in Supabase Storage */
const BUCKET_NAME = "form-uploads";

/**
 * Use the service role client for storage operations
 * so that uploads work regardless of RLS policies.
 */
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    /* Parse the incoming multipart form data */
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const formId = (formData.get("formId") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    /* Validate file size (max 10MB) */
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    /* Generate a unique file path to avoid collisions */
    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${uuidv4()}.${ext}`;
    const filePath = `${formId}/${uniqueName}`;

    /* Convert the File to an ArrayBuffer for upload */
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /* Upload to Supabase Storage */
    const supabase = getStorageClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    /* Get the public URL of the uploaded file */
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      filePath,
    });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}

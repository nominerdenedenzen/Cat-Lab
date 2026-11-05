import { prisma } from "../../_lib/prisma";
// 🟡 CHANGED: import the Supabase client here (on the SERVER) instead of in UploadBox.
// The service-role key is secret, so it must only be used in server code like this file.
import { supabase } from "../../_lib/supabase";
import { NextResponse } from "next/server";

// 🟡 CHANGED: the name of your Supabase Storage bucket, kept in one place.
// You must create a bucket with this exact name in Supabase → Storage.
const BUCKET = "photos";

export async function GET() {
  // 🟡 CHANGED: wrapped in try/catch so you see the real error instead of an empty 500
  try {
    const photos = await prisma.photo.findMany({ orderBy: { createdAt: "asc" } });

    // 🟡 CHANGED: add a public URL to each photo so the frontend can show it in an <img>.
    // The database only stores the path (e.g. "uploads/123-dog.jpg"), not the full URL.
    const photosWithUrl = photos.map((photo) => ({
      ...photo,
      url: supabase.storage.from(BUCKET).getPublicUrl(photo.storagePath).data
        .publicUrl,
    }));

    return NextResponse.json(photosWithUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 🟡 CHANGED: before, this did `request.json()` and expected a `storagePath`.
    // But page.tsx sends a FormData with the actual image file, so we read formData instead.
    const formData = await request.formData();
    const file = formData.get("file");

    // 🟡 CHANGED: check that a real file was sent.
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 🟡 CHANGED: build a unique path so two photos named "dog.jpg" don't overwrite each other.
    const storagePath = `uploads/${Date.now()}-${file.name}`;

    // 🟡 CHANGED: STEP 1 — upload the image file to Supabase Storage.
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // STEP 2 — save a row in the database (via Prisma) that remembers where the file is.
    const label = formData.get("label"); // 🟡 CHANGED: label now comes from formData (optional)
    const photo = await prisma.photo.create({
      data: {
        storagePath,
        // 🟡 CHANGED (cat → dog)
        label: label === "DOG" || label === "NOT_DOG" ? label : null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

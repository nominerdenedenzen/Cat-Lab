import { prisma } from "../../_lib/prisma";

import { supabase } from "../../_lib/supabase";
import { NextResponse } from "next/server";

const BUCKET = "photos";

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "asc" },
    });

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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Supabase Storage only accepts simple characters in file paths, so replace
    // anything else (spaces, Cyrillic, emoji, macOS's special space in screenshot names...)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `uploads/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const label = formData.get("label");
    const photo = await prisma.photo.create({
      data: {
        storagePath,
        label: label === "DOG" || label === "NOT_DOG" ? label : null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

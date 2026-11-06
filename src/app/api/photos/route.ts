import { NextResponse } from "next/server";
import { prisma } from "../../_lib/prisma";
import { supabase } from "../../_lib/supabase";

const BUCKET = "photos";

// GET /api/photos → all photos from the database, each with a public URL
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

// POST /api/photos → upload one file to Supabase Storage, then save it in Prisma
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const storagePath = `uploads/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const photo = await prisma.photo.create({ data: { storagePath } });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

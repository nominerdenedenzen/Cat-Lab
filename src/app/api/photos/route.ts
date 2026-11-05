import { prisma } from "../../_lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.storagePath) {
      return NextResponse.json(
        { error: "No storagePath provided" },
        { status: 400 },
      );
    }

    const photo = await prisma.photo.create({
      data: {
        storagePath: body.storagePath,
        label: body.label || null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

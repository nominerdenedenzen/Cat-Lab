import { prisma } from "../../_lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  const body = await request.json();

  const photo = await prisma.photo.create({
    data: {
      storagePath: "test/path",
      label: body.label, // optional: leave it out and the label stays empty
    },
  });

  return NextResponse.json(photo, { status: 201 });
}

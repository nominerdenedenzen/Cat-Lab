import { prisma } from "../../../_lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.label !== "DOG" && body.label !== "NOT_DOG") {
      return NextResponse.json(
        { error: "label must be DOG or NOT_DOG" },
        { status: 400 },
      );
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: { label: body.label },
    });

    return NextResponse.json(photo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

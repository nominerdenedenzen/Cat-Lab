// 🟢 NEW FILE: PATCH /api/photos/<id>  → saves the label (DOG / NOT_DOG) for one photo.
// Step 2 (Label) calls this every time you click "Dog" or "Not dog".
import { prisma } from "../../../_lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  // In this Next.js version `params` is a Promise, so we must `await` it
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 🟡 CHANGED (cat → dog): only DOG / NOT_DOG are allowed now
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

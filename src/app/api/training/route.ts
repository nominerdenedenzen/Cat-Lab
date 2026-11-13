import { NextResponse } from "next/server";
import { prisma } from "../../_lib/prisma";

// POST /api/training → save one training run (rounds + final accuracy)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rounds = Number(body.rounds);
    const accuracy = Number(body.accuracy);

    if (!Number.isInteger(rounds) || rounds < 1) {
      return NextResponse.json(
        { error: "rounds must be a whole number ≥ 1" },
        { status: 400 },
      );
    }
    if (!(accuracy >= 0 && accuracy <= 1)) {
      return NextResponse.json(
        { error: "accuracy must be between 0 and 1" },
        { status: 400 },
      );
    }

    const run = await prisma.trainingRun.create({ data: { rounds, accuracy } });
    return NextResponse.json(run, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

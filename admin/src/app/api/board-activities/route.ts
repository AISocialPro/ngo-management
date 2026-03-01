import { NextResponse } from "next/server";
import { listBoardActivities, createBoardActivity } from "@/lib/activities/service";
import { ActivityStatus } from "@prisma/client";

export async function GET() {
  try {
    return NextResponse.json(await listBoardActivities());
  } catch (e) {
    return new NextResponse("Failed", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createBoardActivity({
      type: body.type,
      status: body.status as ActivityStatus,
      title: body.title,
      place: body.place,
      time: body.time,
      participants: body.participants ?? [],
      extraText: body.extraText ?? null,
      cta: body.cta ?? null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return new NextResponse("Failed to create", { status: 500 });
  }
}

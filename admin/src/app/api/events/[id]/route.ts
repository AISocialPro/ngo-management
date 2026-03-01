import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ---------------- UPDATE EVENT ---------------- */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        name: body.title,
        location: body.location,
        description: body.description,
        dateISO: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        expected: body.capacity,
        type: body.category || "OTHER",
        status:
          body.status === "Active"
            ? "ACTIVE"
            : body.status === "Completed"
            ? "COMPLETED"
            : "UPCOMING",
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE EVENT ---------------- */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 }
    );
  }
}

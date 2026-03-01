import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* GET EVENTS */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mappedEvents = events.map((e) => {
      let date = "";
      if (e.dateISO instanceof Date && !isNaN(e.dateISO.getTime())) {
        date = e.dateISO.toISOString().split("T")[0];
      }

      // Map Prisma EventType enum values to frontend category names
      const typeMap: Record<string, string> = {
        "WORKSHOP": "Workshop",
        "FUNDRAISER": "Fundraiser", 
        "MEETING": "Meeting",
        "VOLUNTEERING": "Volunteering",
        "OTHER": "Other"
      };

      return {
        id: e.id,
        _id: e.id,
        title: e.name,
        location: e.location,
        description: e.description ?? "",
        date,
        startTime: e.startTime ?? "",
        endTime: e.endTime ?? "",
        status:
          e.status === "UPCOMING"
            ? "Upcoming"
            : e.status === "COMPLETED"
            ? "Completed"
            : "Active",
        organizer: e.organizer ?? "N/A",
        category: typeMap[e.type] || "Other",
        capacity: e.expected ?? undefined,
        ngoId: e.ngoId,
      };
    });

    return NextResponse.json(mappedEvents, { status: 200 });
  } catch (error) {
    console.error("FETCH EVENTS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch events", error: String(error) },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE EVENT */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("CREATE EVENT - Received data:", body);

    /* ---------------- Validation ---------------- */
    const requiredFields = [
      { field: "title", name: "Title" },
      { field: "date", name: "Date" },
      { field: "location", name: "Location" },
    ];

    for (const { field, name } of requiredFields) {
      if (!body[field] || !body[field].toString().trim()) {
        return NextResponse.json(
          { message: `${name} is required` },
          { status: 400 }
        );
      }
    }

    const dateObj = new Date(body.date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (body.capacity !== undefined && body.capacity !== null && body.capacity !== "") {
      const cap = Number(body.capacity);
      if (isNaN(cap) || cap < 0) {
        return NextResponse.json(
          { message: "Capacity must be a positive number" },
          { status: 400 }
        );
      }
    }

    /* ---------------- Map category to EventType enum ---------------- */
    // Map frontend category names to Prisma EventType enum values
    const categoryMap: Record<string, string> = {
      "Workshop": "WORKSHOP",
      "Fundraiser": "FUNDRAISER", 
      "Meeting": "MEETING",
      "Volunteering": "VOLUNTEERING",
      "Other": "OTHER"
    };

    // Get the category from request or default to "Other"
    const category = body.category || "Other";
    const eventType = categoryMap[category] || "OTHER";

    // Validate that the eventType is a valid enum value
    const validEventTypes = ["WORKSHOP", "FUNDRAISER", "MEETING", "VOLUNTEERING", "OTHER"];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { 
          message: "Invalid category. Must be one of: Workshop, Fundraiser, Meeting, Volunteering, Other",
          validCategories: ["Workshop", "Fundraiser", "Meeting", "Volunteering", "Other"]
        },
        { status: 400 }
      );
    }

    /* ---------------- Get or create a default NGO ---------------- */
    let ngoId = "default-ngo-id";
    
    try {
      // Try to get an existing NGO
      const existingNgo = await prisma.nGO.findFirst();
      if (existingNgo) {
        ngoId = existingNgo.id;
      } else {
        // Create a default NGO if none exists
        const newNgo = await prisma.nGO.create({
          data: {
            name: "Default NGO",
            // Add any other required fields for your NGO model
          },
        });
        ngoId = newNgo.id;
        console.log("Created default NGO with ID:", ngoId);
      }
    } catch (ngoError: any) {
      console.warn("NGO handling warning:", ngoError.message);
      // Continue with default ID if NGO operations fail
    }

    /* ---------------- Create Event ---------------- */
    const eventData = {
      ngoId: ngoId, // Use the NGO ID
      name: body.title.trim(),
      location: body.location.trim(),
      description: body.description?.trim() || "",
      dateISO: dateObj,
      startTime: body.startTime?.trim() || null,
      endTime: body.endTime?.trim() || null,
      expected: body.capacity ? Number(body.capacity) : null,
      type: eventType, // Use the mapped enum value
      status: "UPCOMING",
      organizer: body.organizer?.trim() || "N/A",
    };

    console.log("Creating event with data:", eventData);

    const createdEvent = await prisma.event.create({
      data: eventData,
    });

    const responseDate =
      createdEvent.dateISO instanceof Date && !isNaN(createdEvent.dateISO.getTime())
        ? createdEvent.dateISO.toISOString().split("T")[0]
        : "";

    // Map the enum value back to category name for response
    const reverseTypeMap: Record<string, string> = {
      "WORKSHOP": "Workshop",
      "FUNDRAISER": "Fundraiser", 
      "MEETING": "Meeting",
      "VOLUNTEERING": "Volunteering",
      "OTHER": "Other"
    };

    return NextResponse.json(
      {
        id: createdEvent.id,
        _id: createdEvent.id,
        title: createdEvent.name,
        location: createdEvent.location,
        description: createdEvent.description,
        date: responseDate,
        startTime: createdEvent.startTime ?? "",
        endTime: createdEvent.endTime ?? "",
        status: "Upcoming",
        category: reverseTypeMap[createdEvent.type] || "Other",
        capacity: createdEvent.expected ?? undefined,
        organizer: createdEvent.organizer ?? "N/A",
        ngoId: createdEvent.ngoId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE EVENT ERROR:", error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          message: "Event creation failed due to duplicate data",
          details: error.meta?.target || "Constraint violation",
        },
        { status: 409 }
      );
    }

    // Handle missing field errors
    if (error.message?.includes("Argument") && error.message?.includes("is missing")) {
      const missingField = error.message.match(/Argument `(\w+)` is missing/)?.[1];
      return NextResponse.json(
        {
          message: `Missing required field: ${missingField}`,
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create event",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE EVENT */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");
    const body = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title !== undefined) updateData.name = body.title.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.date !== undefined) {
      const dateObj = new Date(body.date);
      if (!isNaN(dateObj.getTime())) {
        updateData.dateISO = dateObj;
      }
    }
    if (body.startTime !== undefined) updateData.startTime = body.startTime?.trim() || null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime?.trim() || null;
    if (body.capacity !== undefined) updateData.expected = body.capacity ? Number(body.capacity) : null;
    
    // Map category to EventType for update
    if (body.category !== undefined) {
      const categoryMap: Record<string, string> = {
        "Workshop": "WORKSHOP",
        "Fundraiser": "FUNDRAISER", 
        "Meeting": "MEETING",
        "Volunteering": "VOLUNTEERING",
        "Other": "OTHER"
      };
      const category = body.category || "Other";
      const eventType = categoryMap[category] || "OTHER";
      
      // Validate event type
      const validEventTypes = ["WORKSHOP", "FUNDRAISER", "MEETING", "VOLUNTEERING", "OTHER"];
      if (!validEventTypes.includes(eventType)) {
        return NextResponse.json(
          { 
            message: "Invalid category. Must be one of: Workshop, Fundraiser, Meeting, Volunteering, Other",
            validCategories: ["Workshop", "Fundraiser", "Meeting", "Volunteering", "Other"]
          },
          { status: 400 }
        );
      }
      
      updateData.type = eventType;
    }
    
    if (body.organizer !== undefined) updateData.organizer = body.organizer?.trim() || "N/A";
    
    // Update status if provided
    if (body.status !== undefined) {
      const statusMap: Record<string, string> = {
        "Active": "ACTIVE",
        "Upcoming": "UPCOMING",
        "Completed": "COMPLETED"
      };
      updateData.status = statusMap[body.status] || "UPCOMING";
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    const responseDate =
      updatedEvent.dateISO instanceof Date && !isNaN(updatedEvent.dateISO.getTime())
        ? updatedEvent.dateISO.toISOString().split("T")[0]
        : "";

    // Map enum value back to category name
    const reverseTypeMap: Record<string, string> = {
      "WORKSHOP": "Workshop",
      "FUNDRAISER": "Fundraiser", 
      "MEETING": "Meeting",
      "VOLUNTEERING": "Volunteering",
      "OTHER": "Other"
    };

    return NextResponse.json(
      {
        id: updatedEvent.id,
        _id: updatedEvent.id,
        title: updatedEvent.name,
        location: updatedEvent.location,
        description: updatedEvent.description,
        date: responseDate,
        startTime: updatedEvent.startTime ?? "",
        endTime: updatedEvent.endTime ?? "",
        status: updatedEvent.status === "UPCOMING" ? "Upcoming" : 
               updatedEvent.status === "COMPLETED" ? "Completed" : "Active",
        category: reverseTypeMap[updatedEvent.type] || "Other",
        capacity: updatedEvent.expected ?? undefined,
        organizer: updatedEvent.organizer ?? "N/A",
        ngoId: updatedEvent.ngoId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPDATE EVENT ERROR:", error);
    return NextResponse.json(
      {
        message: "Failed to update event",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE EVENT */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE EVENT ERROR:", error);
    return NextResponse.json(
      {
        message: "Failed to delete event",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
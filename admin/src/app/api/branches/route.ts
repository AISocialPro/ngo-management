// src/app/api/branches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNgoId } from "@/lib/getNgoId";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const branchSelect = {
  id: true,
  name: true,
  status: true,
  manager: true,
  phone: true,
  email: true,
  address: true,
  staff: true,
  beneficiaries: true,
  funding: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

async function getAuthenticatedNgoId(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.getAll().find((c) => 
        c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
      );
      
      if (authCookie) {
        try {
          const session = JSON.parse(authCookie.value);
          token = session.access_token;
        } catch {}
      }
    }

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.user_metadata?.ngo_id) {
        return user.user_metadata.ngo_id;
      }
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  }

  // Fallback to default resolution
  try {
    return await getNgoId();
  } catch (e: any) {
    if (e.code !== 'P2021' && e.code !== 'P2022') {
      console.warn("Failed to resolve NGO ID (DB might be uninitialized):", e);
    }
    return "00000000-0000-0000-0000-000000000000";
  }
}

/* ----------------------------- GET /api/branches ----------------------------- */
/** List all branches for the current NGO (multi-tenant safe). */
export async function GET(req: Request) {
  try {
    const ngoId = await getAuthenticatedNgoId(req);

    const branches = await prisma.branch.findMany({
      where: { ngoId },
      orderBy: { createdAt: "desc" },
      select: branchSelect,
    });

    return NextResponse.json(branches);
  } catch (err: any) {
    console.error("GET /api/branches error:", err);
    // Handle missing table/column errors gracefully
    if (err.code === 'P2021' || err.code === 'P2022') {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: err?.message || "Failed to load branches" },
      { status: 500 }
    );
  }
}

/* ----------------------------- POST /api/branches ----------------------------- */
/** Create a new branch for current NGO. */
export async function POST(req: Request) {
  try {
    const ngoId = await getAuthenticatedNgoId(req);
    const body = await req.json();

    const { name, manager, phone, email, address } = body ?? {};
    if (!name || !manager || !phone || !email || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        ngoId,
        name,
        manager,
        phone,
        email,
        address,
        staff: Number(body.staff ?? 0),
        beneficiaries: Number(body.beneficiaries ?? 0),
        funding: body.funding ?? "$0",
        notes: body.notes ?? null,
        status:
          (body.status === "inactive" ? "INACTIVE" : "ACTIVE") as any, // ui -> enum
      },
      select: branchSelect,
    });

    return NextResponse.json(branch);
  } catch (err: any) {
    console.error("POST /api/branches error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create branch" },
      { status: 500 }
    );
  }
}

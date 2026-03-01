// src/app/api/branches/[id]/route.ts
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

async function findBranchForTenant(id: string, ngoId: string) {
  return prisma.branch.findFirst({
    where: { id, ngoId },
    select: branchSelect,
  });
}

/* ----------------------------- GET /api/branches/[id] ----------------------------- */
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const ngoId = await getAuthenticatedNgoId(req);
    const branch = await findBranchForTenant(params.id, ngoId);

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (err: any) {
    console.error("GET /api/branches/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

/* ----------------------------- PATCH /api/branches/[id] ----------------------------- */
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const ngoId = await getAuthenticatedNgoId(req);
    const id = params.id;
    const body = await req.json();

    const existing = await prisma.branch.findFirst({
      where: { id, ngoId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.manager !== undefined) data.manager = body.manager;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.address !== undefined) data.address = body.address;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.funding !== undefined) data.funding = body.funding;
    if (body.staff !== undefined)
      data.staff = Number.isNaN(Number(body.staff)) ? 0 : Number(body.staff);
    if (body.beneficiaries !== undefined)
      data.beneficiaries = Number.isNaN(Number(body.beneficiaries))
        ? 0
        : Number(body.beneficiaries);

    if (body.status !== undefined) {
      data.status =
        (body.status === "inactive" ? "INACTIVE" : "ACTIVE") as any;
    }

    const updated = await prisma.branch.update({
      where: { id },
      data,
      select: branchSelect,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/branches/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update branch" },
      { status: 500 }
    );
  }
}

/* ----------------------------- DELETE /api/branches/[id] ----------------------------- */
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const ngoId = await getAuthenticatedNgoId(req);
    const id = params.id;

    const existing = await prisma.branch.findFirst({
      where: { id, ngoId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    await prisma.branch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/branches/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete branch" },
      { status: 500 }
    );
  }
}

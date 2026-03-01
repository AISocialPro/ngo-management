import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { resolveNgoId } from "@/lib/_utils/tenant";

export async function GET(req: Request) {
  const ngoId = await resolveNgoId(req);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const vols = await prisma.volunteer.findMany({ where: { ngoId } });
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 800;

  page.drawText(`Volunteer Report – ${month}/${year}`, { x: 200, y, size: 18, font });
  y -= 30;

  for (const v of vols) {
    page.drawText(`${v.name} (${v.totalHours} hrs)`, { x: 60, y, size: 12, font });
    y -= 20;
    if (y < 60) { y = 800; pdf.addPage([595, 842]); }
  }

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: { "Content-Type": "application/pdf" },
  });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { user } = await req.json();

  if (!user?.email) {
    return NextResponse.json({ error: 'No email' }, { status: 400 });
  }

  // ✅ Handle Company Signup Flow
  const metadata = user.user_metadata || {};
  if (metadata.flow === 'company-signup') {
    const { companyName, domain, adminName } = metadata;

    let company = await prisma.company.findUnique({
      where: { domain },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          domain,
          plan: 'pro',
        },
      });
    }

    await prisma.user.upsert({
      where: { email: user.email },
      update: { lastLogin: new Date(), companyId: company.id },
      create: {
        email: user.email,
        name: adminName,
        role: 'OWNER',
        companyId: company.id,
        isActive: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ success: true });
  }

  const userCount = await prisma.user.count();

  if (userCount === 0) {
    const domain = user.email.split('@')[1];

    const company = await prisma.company.create({
      data: {
        name: 'Default Company',
        domain,
        plan: 'pro',
      },
    });

    await prisma.user.create({
      data: {
        email: user.email,
        role: 'OWNER',
        companyId: company.id,
        isActive: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ firstUser: true });
  }

  await prisma.user.upsert({
    where: { email: user.email },
    update: { lastLogin: new Date() },
    create: {
      email: user.email,
      role: 'STAFF',
      isActive: true,
      isVerified: true,
    },
  });

  return NextResponse.json({ ok: true });
}

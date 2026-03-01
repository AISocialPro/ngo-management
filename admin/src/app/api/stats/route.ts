import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get document count
    const totalDocuments = await prisma.document.count({
      where: { userId: user.id },
    });

    // Get checklist stats
    const checklistItems = await prisma.checklistItem.findMany({
      where: { userId: user.id },
    });

    const completed = checklistItems.filter(item => item.done).length;
    const pending = checklistItems.filter(item => !item.done).length;
    const overdue = checklistItems.filter(item => 
      new Date(item.due) < new Date() && !item.done
    ).length;

    // Calculate compliance percentage
    const compliancePercentage = checklistItems.length > 0 
      ? Math.round((completed / checklistItems.length) * 100)
      : 100;

    // Count upcoming deadlines this month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const upcomingDeadlines = checklistItems.filter(item => {
      const dueDate = new Date(item.due);
      return dueDate >= now && dueDate <= endOfMonth && !item.done;
    }).length;

    return NextResponse.json({
      totalDocuments,
      compliancePercentage,
      pendingItems: pending,
      upcomingDeadlines,
      stats: {
        completed,
        pending,
        overdue,
        total: checklistItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
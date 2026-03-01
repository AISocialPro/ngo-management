import { NextRequest, NextResponse } from 'next/server';
import { bulkInviteUsers } from '@/lib/utils/auth';
import { sendInvitationEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['super_admin', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { users } = body;

    const invitations = await bulkInviteUsers(
      session.user.companyId,
      users,
      session.user.id
    );

    // Send invitation emails
    for (const invitation of invitations) {
      await sendInvitationEmail({
        to: invitation.email,
        inviterName: session.user.name || 'Admin',
        companyName: session.user.companyName || 'Your Company',
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.token}`,
        role: invitation.role
      });
    }

    return NextResponse.json({
      success: true,
      message: `${invitations.length} invitations sent`,
      invitations
    });

  } catch (error: any) {
    console.error('Bulk invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitations' },
      { status: 500 }
    );
  }
}
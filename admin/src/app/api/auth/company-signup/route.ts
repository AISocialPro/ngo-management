import { NextRequest, NextResponse } from 'next/server';
import { registerCompany } from '@/lib/utils/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate domain format
    const domain = body.domain.trim().toLowerCase();
    
    // Check if domain has valid extension
    const validExtensions = ['.com', '.in', '.org', '.net', '.co.in', '.co', '.io', 
                           '.ai', '.tech', '.biz', '.info', '.me', '.us', '.uk',
                           '.ca', '.au', '.de', '.fr', '.edu', '.gov'];
    
    const hasValidExtension = validExtensions.some(ext => domain.endsWith(ext));
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Please use a valid domain extension (e.g., .com, .in, .org, .net)' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.companyName || !body.adminEmail || !body.adminPassword || !body.adminName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.adminPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const { company, user, token } = await registerCompany({
      name: body.companyName,
      domain: domain,
      adminEmail: body.adminEmail.toLowerCase(),
      adminPassword: body.adminPassword,
      adminName: body.adminName
    });

    // Try to send welcome email (but don't fail registration if email fails)
    try {
      await sendWelcomeEmail({
        to: body.adminEmail,
        companyName: company.name,
        adminName: body.adminName,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        companyDomain: company.domain
      });
    } catch (emailError) {
      console.warn('Email sending failed, but registration successful:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Company registered successfully',
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        subdomain: company.subdomain
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, { status: 201 });

  } catch (error: any) {
    console.error('Company registration error:', error);
    
    // Handle specific errors
    if (error.message.includes('already registered')) {
      return NextResponse.json(
        { error: 'This domain is already registered. Please use a different domain or contact support.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 400 }
    );
  }
}
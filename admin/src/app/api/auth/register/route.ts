import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.fullName || !body.organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user with pending status
    const hashedPassword = await bcrypt.hash(body.password || 'temp123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.fullName,
        role: 'PENDING', // Special role for pending approval
        isActive: false, // Not active until admin approves
      },
    });

    // Create organization record
    const ngo = await prisma.nGO.create({
      data: {
        name: body.organizationName,
        emailFrom: body.email,
        // Add other fields from registration form
        ...(body.organizationType && { /* map to appropriate fields */ }),
      },
    });

    // Link user to NGO (you might need a UserNGO model for many-to-many)
    // For now, we'll store NGO ID in user (simplified approach)
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        // Assuming you add ngoId to User model
        // ngoId: ngo.id 
      }
    });

    // Send confirmation email
    // await sendEmail({
    //   to: body.email,
    //   subject: 'Registration Request Received',
    //   html: `
    //     <h2>Registration Request Received</h2>
    //     <p>Dear ${body.fullName},</p>
    //     <p>Your registration request for ${body.organizationName} has been received.</p>
    //     <p>An administrator will review your request and activate your account within 24-48 hours.</p>
    //     <p>You will receive another email once your account is activated.</p>
    //   `,
    // });

    // Send notification to admin (optional)
    // await sendAdminNotification(body);

    return NextResponse.json({
      success: true,
      message: 'Registration request submitted successfully',
      userId: user.id,
      ngoId: ngo.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
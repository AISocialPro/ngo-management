import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

// Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set in environment variables');
  console.warn('Using development fallback - Set JWT_SECRET in .env.local for production');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-this-in-production-123';
const JWT_EXPIRY = '7d';

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
} else if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL is invalid. It must start with postgresql:// or postgres://');
}

// ==================== UTILITY FUNCTIONS ====================

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: string, companyId?: string): string {
  const payload: any = { 
    userId, 
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };
  
  if (companyId) {
    payload.companyId = companyId;
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Generate reset token
export function generateResetToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'reset', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// ==================== DATABASE HELPERS ====================

// Check if table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )`;
    return result[0]?.exists || false;
  } catch (error: any) {
    // Don't swallow configuration errors
    if (
      error?.message?.includes('validating datasource') || 
      error?.message?.includes('protocol') ||
      error?.name === 'PrismaClientInitializationError'
    ) {
      console.error('❌ Critical Database Error: Check your DATABASE_URL in .env file');
      throw error;
    }
    console.warn(`Could not check if table ${tableName} exists:`, error.message);
    return false;
  }
}

// Safe find user
async function safeFindUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });
    return user;
  } catch (error: any) {
    // If error is about missing column, try without company
    if (error.message.includes('column') || error.message.includes('relation')) {
      try {
        const user = await prisma.user.findUnique({
          where: { email }
        });
        return user;
      } catch (innerError) {
        console.error('Error finding user:', innerError.message);
        return null;
      }
    }
    console.error('Error finding user:', error.message);
    return null;
  }
}

// ==================== COMPANY REGISTRATION ====================

export async function registerCompany(
  companyData: {
    name: string;
    domain: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
  }
) {
  try {
    // Check if companies table exists
    const companiesTableExists = await tableExists('companies');
    
    // Check if user already exists
    const existingUser = await safeFindUser(companyData.adminEmail);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(companyData.adminPassword);
    
    if (!companiesTableExists) {
      // FALLBACK: Create user without company
      console.log('⚠️  Companies table not found, creating user without company');
      
      const adminUser = await prisma.user.create({
        data: {
          email: companyData.adminEmail,
          name: companyData.adminName,
          passwordHash: passwordHash,
          role: 'super_admin',
          isActive: true,
          isVerified: true,
        }
      });

      const token = generateToken(adminUser.id);

      return {
        company: {
          id: 'temp-company-id',
          name: companyData.name,
          domain: companyData.domain,
          subdomain: companyData.name.toLowerCase().replace(/\s+/g, '-')
        },
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        },
        token,
        warning: 'Companies table not found. User created without company association.'
      };
    }

    // Check if company exists (only if table exists)
    const existingCompany = await prisma.company.findUnique({
      where: { domain: companyData.domain }
    });

    if (existingCompany) {
      throw new Error('Company domain already registered');
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyData.name,
        domain: companyData.domain,
        subdomain: companyData.name.toLowerCase().replace(/\s+/g, '-'),
      }
    });

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: companyData.adminEmail,
        passwordHash: passwordHash,
        name: companyData.adminName,
        role: 'super_admin',
        companyId: company.id,
        isVerified: true,
        isActive: true
      }
    });

    // Generate token
    const token = generateToken(adminUser.id, company.id);

    return {
      company,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      token
    };

  } catch (error: any) {
    console.error('Company registration error:', error);
    
    // Handle specific database errors
    if (error.message?.includes('validating datasource')) {
      throw new Error('Database configuration error: Invalid DATABASE_URL. Please check your .env file.');
    }
    
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      throw new Error('Database configuration error. Please run database migrations.');
    }
    
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        throw new Error('User with this email already exists');
      }
      if (error.meta?.target?.includes('domain')) {
        throw new Error('Company domain already registered');
      }
    }
    
    throw new Error(error.message || 'Registration failed');
  }
}

// ==================== LOGIN ====================

export async function loginUser(email: string, password: string) {
  try {
    const user = await safeFindUser(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has password hash (for existing users without password)
    if (!user.passwordHash) {
      throw new Error('Please set a password for your account');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Your account is not active. Please contact administrator.');
    }

    // Update last login
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    } catch (updateError) {
      console.warn('Could not update last login:', updateError.message);
    }

    // Generate token
    const token = generateToken(user.id, user.companyId || undefined);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      company: user.company
    };

  } catch (error: any) {
    console.error('Login error:', error.message);
    throw new Error(error.message || 'Login failed');
  }
}

// ==================== BULK INVITE ====================

export async function bulkInviteUsers(
  companyId: string,
  users: Array<{ email: string; role?: string; department?: string }>,
  inviterId: string
) {
  try {
    // Check if invitations table exists
    const invitationsTableExists = await tableExists('invitations');
    
    if (!invitationsTableExists) {
      throw new Error('Invitations table not found. Please run database migrations.');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const invitations = [];
    const crypto = require('crypto');

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await safeFindUser(userData.email);
      if (existingUser) {
        console.warn(`User ${userData.email} already exists, skipping invitation`);
        continue;
      }

      const token = crypto.randomBytes(32).toString('hex');
      
      const invitation = await prisma.invitation.create({
        data: {
          email: userData.email,
          token,
          role: userData.role || 'employee',
          companyId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      invitations.push(invitation);
    }

    return {
      success: true,
      invitations,
      message: `${invitations.length} invitations created successfully`
    };

  } catch (error: any) {
    console.error('Bulk invite error:', error);
    throw new Error(error.message || 'Failed to create invitations');
  }
}

// ==================== PASSWORD RESET ====================

export async function initiatePasswordReset(email: string) {
  try {
    const user = await safeFindUser(email);
    
    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: 'If email exists, reset link sent' };
    }

    const resetToken = generateResetToken(user.id);
    
    // You might want to store this token in database for validation
    // For now, we'll just return it
    
    return {
      success: true,
      resetToken,
      userId: user.id,
      message: 'Reset token generated'
    };

  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error('Failed to initiate password reset');
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'reset') {
      throw new Error('Invalid or expired reset token');
    }

    const userId = decoded.userId;
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return {
      success: true,
      message: 'Password updated successfully'
    };

  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error('Failed to reset password');
  }
}

// ==================== USER MANAGEMENT ====================

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;

  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: { name?: string; department?: string }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;

  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Failed to update profile');
  }
}

// ==================== TEST FUNCTION ====================

export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    return {
      connected: true,
      tables: tables.map((t: any) => t.table_name),
      companiesTable: tables.some((t: any) => t.table_name === 'companies'),
      usersTable: tables.some((t: any) => t.table_name === 'users')
    };
    
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
      tables: []
    };
  } finally {
    await prisma.$disconnect();
  }
}
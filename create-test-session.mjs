import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createTestSession() {
  try {
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vacationplanner.com' }
    });

    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }

    // Create session token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create session in database
    const session = await prisma.session.create({
      data: {
        token,
        userId: adminUser.id,
        expiresAt
      }
    });

    console.log('Session created successfully!');
    console.log('Token:', token);
    console.log('Expires:', expiresAt);
    console.log('\nUse this in your requests:');
    console.log(`Cookie: session_token=${token}`);
    console.log(`OR`);
    console.log(`Authorization: Bearer ${token}`);

  } catch (error) {
    console.error('Error creating session:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession();

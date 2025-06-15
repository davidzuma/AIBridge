const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isPremium: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
            chats: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== AIBridge Advisory - Current Users ===\n');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   Premium: ${user.isPremium ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Accounts: ${user._count.accounts}`);
        console.log(`   Active Sessions: ${user._count.sessions}`);
        console.log(`   Chats: ${user._count.chats}`);
        console.log('   ---');
      });
      
      console.log(`\nTotal Users: ${users.length}\n`);
    }

    // Count by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    console.log('=== Users by Role ===');
    usersByRole.forEach(group => {
      console.log(`${group.role || 'user'}: ${group._count.id}`);
    });

  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

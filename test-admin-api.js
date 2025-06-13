const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminAPI() {
  try {
    console.log('Testing admin API logic...');
    
    // Simulate the admin API logic
    const chats = await prisma.chat.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isPremium: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log('Found chats:', chats.length);

    // Get files for each chat using raw SQL
    const chatsWithFiles = await Promise.all(
      chats.map(async (chat) => {
        const files = await prisma.$queryRaw`
          SELECT * FROM "ChatFile" WHERE "chatId" = ${chat.id}
        `;
        return {
          ...chat,
          files
        };
      })
    );

    console.log('\n=== CHATS WITH FILES ===');
    chatsWithFiles.forEach((chat) => {
      console.log(`Chat ID: ${chat.id}`);
      console.log(`User: ${chat.user.name} (${chat.user.email})`);
      console.log(`Premium: ${chat.user.isPremium}`);
      console.log(`Status: ${chat.status}`);
      console.log(`Files count: ${chat.files ? chat.files.length : 0}`);
      if (chat.files && chat.files.length > 0) {
        console.log('Files:', chat.files.map(f => f.originalName));
      }
      console.log('----');
    });

    // Filter for review chats (same logic as frontend)
    const reviewChats = chatsWithFiles.filter((chat) => 
      chat.status === "revision_requerida" || 
      (chat.user.isPremium && chat.status === "ai_respondido")
    );

    console.log('\n=== REVIEW CHATS ===');
    console.log('Review chats count:', reviewChats.length);
    reviewChats.forEach((chat) => {
      console.log(`Chat ID: ${chat.id}`);
      console.log(`User: ${chat.user.name} (Premium: ${chat.user.isPremium})`);
      console.log(`Status: ${chat.status}`);
      console.log(`Files: ${chat.files ? chat.files.length : 0}`);
      console.log('----');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI();

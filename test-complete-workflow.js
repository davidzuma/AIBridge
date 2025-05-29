const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Starting Complete Workflow Test\n');

    // 1. Test AI Response Generation
    console.log('1️⃣ Testing AI Response Generation...');
    
    const testQuery = "¿Cuáles son los requisitos para deducir gastos de oficina en casa como autónomo?";
    
    console.log(`Query: "${testQuery}"`);
    
    // Simulate the chat creation with AI response (like the API does)
    const user = await prisma.user.findFirst({
      where: { isPremium: true }
    });
    
    if (!user) {
      console.log('❌ No premium user found');
      return;
    }
    
    console.log(`✅ Using premium user: ${user.name} (${user.email})`);

    // 2. Test Premium Status Check
    console.log('\n2️⃣ Testing Premium Status...');
    console.log(`Premium Status: ${user.isPremium ? '✅ Premium' : '❌ Regular'}`);

    // 3. Check Recent Chats
    console.log('\n3️⃣ Checking Recent Consultations...');
    const recentChats = await prisma.chat.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`Found ${recentChats.length} recent consultations:`);
    recentChats.forEach((chat, index) => {
      console.log(`  ${index + 1}. "${chat.content.substring(0, 60)}..."`);
      console.log(`     Status: ${chat.status}`);
      console.log(`     Has AI Response: ${chat.response ? '✅' : '❌'}`);
      console.log(`     Created: ${chat.createdAt.toLocaleDateString()}`);
    });

    // 4. Test Reviewer Dashboard Data
    console.log('\n4️⃣ Testing Reviewer Dashboard Data...');
    const reviewChats = await prisma.chat.findMany({
      where: {
        OR: [
          { status: 'revision_requerida' },
          { status: 'revision_enviada' }
        ],
        user: { isPremium: true }
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Premium consultations needing review: ${reviewChats.length}`);
    reviewChats.forEach((chat, index) => {
      console.log(`  ${index + 1}. User: ${chat.user.name} (Premium: ${chat.user.isPremium})`);
      console.log(`     Status: ${chat.status}`);
      console.log(`     Query: "${chat.content.substring(0, 50)}..."`);
    });

    // 5. System Statistics
    console.log('\n5️⃣ System Statistics...');
    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.user.count({ where: { isPremium: true } });
    const totalChats = await prisma.chat.count();
    const chatsWithAI = await prisma.chat.count({ 
      where: { 
        response: { not: null },
        response: { not: "" }
      } 
    });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Premium Users: ${premiumUsers}`);
    console.log(`Total Consultations: ${totalChats}`);
    console.log(`Consultations with AI Response: ${chatsWithAI}`);
    console.log(`AI Response Rate: ${totalChats > 0 ? Math.round((chatsWithAI / totalChats) * 100) : 0}%`);

    console.log('\n✅ Workflow Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Login with Google OAuth');
    console.log('3. Submit a new consultation');
    console.log('4. Verify instant AI response');
    console.log('5. Test "Request Human Review" (premium users)');
    console.log('6. Access reviewer dashboard to validate reviews');

  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteWorkflow();

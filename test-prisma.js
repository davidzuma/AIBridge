const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Available models:', Object.getOwnPropertyNames(prisma));
    
    // Test creating a chat file
    const testFile = await prisma.chatFile.create({
      data: {
        chatId: 'test-chat-id',
        fileName: 'test.pdf',
        originalName: 'test-file.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        filePath: '/uploads/test.pdf'
      }
    });
    
    console.log('Created test file:', testFile);
    
    // Clean up
    await prisma.chatFile.delete({
      where: { id: testFile.id }
    });
    
    console.log('Test successful!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();

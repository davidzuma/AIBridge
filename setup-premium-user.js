const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setPremiumUser() {
  try {
    // Get the first user and make them premium
    const users = await prisma.user.findMany({
      take: 1
    })
    
    if (users.length === 0) {
      console.log('No users found. Please create a user first by logging in.')
      return
    }
    
    const user = users[0]
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true }
    })
    
    console.log(`✅ User ${updatedUser.name} (${updatedUser.email}) is now Premium!`)
    
  } catch (error) {
    console.error('Error setting premium user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setPremiumUser()

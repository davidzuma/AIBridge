const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupReviewer() {
  console.log('🚀 Iniciando configuración del revisor...')
  
  try {
    const email = 'david.zumaquero@energyai.berlin'
    console.log(`🔍 Buscando usuario: ${email}`)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      console.log(`❌ Usuario ${email} no encontrado en la base de datos.`)
      console.log('🔄 Primero debes iniciar sesión con Google OAuth en la aplicación.')
      console.log('📍 Ve a http://localhost:3000 e inicia sesión con tu cuenta de Google.')
      console.log('🔧 Luego ejecuta este script nuevamente: npm run setup:reviewer')
      return
    }
    
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`)
    console.log(`📊 Rol actual: ${user.role}`)
    
    if (user.role === 'revisor') {
      console.log('✅ El usuario ya tiene rol de revisor!')
      return
    }
    
    // Update user role to reviewer
    console.log('🔄 Actualizando rol a revisor...')
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { role: 'revisor' }
    })
    
    console.log('✅ Usuario actualizado correctamente:')
    console.log(`   📧 Email: ${updatedUser.email}`)
    console.log(`   👤 Nombre: ${updatedUser.name}`)
    console.log(`   🔧 Rol: ${updatedUser.role}`)
    console.log(`   📅 Creado: ${updatedUser.createdAt}`)
    
    // Show all reviewers
    const reviewers = await prisma.user.findMany({
      where: { role: 'revisor' }
    })
    
    console.log('\n📋 Todos los revisores en el sistema:')
    reviewers.forEach((reviewer, index) => {
      console.log(`   ${index + 1}. ${reviewer.name} (${reviewer.email})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('🔍 Stack trace:', error.stack)
  } finally {
    console.log('🔌 Cerrando conexión a la base de datos...')
    await prisma.$disconnect()
    console.log('✅ Script completado.')
  }
}

console.log('📋 MZChat - Configuración de Revisor')
console.log('=====================================')
setupReviewer()

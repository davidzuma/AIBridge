import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Get form fields
    const professionalTitle = formData.get('professionalTitle') as string
    const licenseNumber = formData.get('licenseNumber') as string
    const specialization = formData.get('specialization') as string
    const experience = formData.get('experience') as string
    const phone = formData.get('phone') as string
    const linkedin = formData.get('linkedin') as string
    const bio = formData.get('bio') as string
    const certificationFile = formData.get('certification') as File

    // Validate required fields
    if (!professionalTitle || !licenseNumber || !specialization || !experience || !bio || !certificationFile) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(certificationFile.type)) {
      return NextResponse.json({ message: 'Invalid file type. Please upload PDF, JPG, or PNG.' }, { status: 400 })
    }

    if (certificationFile.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ message: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'certifications')
    
    // Generate unique filename
    const fileExtension = certificationFile.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file
    const bytes = await certificationFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error('Error saving file:', error)
      return NextResponse.json({ message: 'Failed to save certification file' }, { status: 500 })
    }

    // Check if user already has a reviewer application
    const existingApplication = await prisma.reviewerApplication.findUnique({
      where: { userEmail: session.user.email }
    })

    if (existingApplication) {
      return NextResponse.json({ message: 'You have already submitted a reviewer application' }, { status: 400 })
    }

    // Save application to database
    const application = await prisma.reviewerApplication.create({
      data: {
        userEmail: session.user.email,
        userName: session.user.name || '',
        professionalTitle,
        licenseNumber,
        specialization,
        experience,
        phone: phone || null,
        linkedin: linkedin || null,
        bio,
        certificationFilePath: `uploads/certifications/${fileName}`,
        status: 'pending',
        submittedAt: new Date()
      }
    })

    // TODO: Send notification email to admin team
    // TODO: Send confirmation email to applicant

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId: application.id
    })

  } catch (error) {
    console.error('Error processing reviewer application:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

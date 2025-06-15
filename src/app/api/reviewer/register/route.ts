import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    // Get the current session to identify the user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be logged in to register as a reviewer" }, { status: 401 })
    }

    const formData = await request.formData()
    
    const fullName = formData.get('fullName') as string
    const specialization = formData.get('specialization') as string
    const professionalTitle = formData.get('professionalTitle') as string
    const licenseNumber = formData.get('licenseNumber') as string
    const experience = formData.get('experience') as string
    const phone = formData.get('phone') as string
    const linkedin = formData.get('linkedin') as string
    const bio = formData.get('bio') as string
    const file = formData.get('certification') as File

    if (!fullName || !specialization || !professionalTitle || !licenseNumber || !experience || !bio || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already has a reviewer application
    const existingApplication = await prisma.reviewerApplication.findUnique({
      where: { userEmail: session.user.email }
    })

    if (existingApplication) {
      return NextResponse.json({ 
        error: "You have already submitted a reviewer application. Please contact support if you need to update it." 
      }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'certifications')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch {
      // Directory might already exist, ignore error
    }

    // Save certification file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `cert_${Date.now()}_${file.name}`
    const filePath = path.join(uploadsDir, fileName)
    
    await writeFile(filePath, buffer)

    // Update user role to reviewer and verify email
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: 'reviewer',
        emailVerified: new Date(),
        name: fullName // Update name if provided
      }
    })
    
    // Store the application record for reference
    await prisma.reviewerApplication.create({
      data: {
        userEmail: session.user.email,
        userName: fullName,
        professionalTitle,
        licenseNumber,
        specialization,
        experience,
        phone: phone || null,
        linkedin: linkedin || null,
        bio,
        certificationFilePath: fileName,
        status: 'approved'
      }
    })

    return NextResponse.json({ 
      message: "Registration successful! You are now a verified reviewer and can access both user and reviewer features.",
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Error registering reviewer:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

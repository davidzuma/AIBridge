import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const specialization = formData.get('specialization') as string
    const professionalTitle = formData.get('professionalTitle') as string
    const licenseNumber = formData.get('licenseNumber') as string
    const experience = formData.get('experience') as string
    const phone = formData.get('phone') as string
    const linkedin = formData.get('linkedin') as string
    const bio = formData.get('bio') as string
    const file = formData.get('certification') as File

    if (!email || !fullName || !specialization || !professionalTitle || !licenseNumber || !experience || !bio || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Save certification file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `cert_${Date.now()}_${file.name}`
    const filePath = path.join(process.cwd(), 'uploads', 'certifications', fileName)
    
    await writeFile(filePath, buffer)

    // Create user account directly as verified reviewer
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: 'revisor',
        emailVerified: new Date()
      }
    })

    // Store the application record for reference
    const application = await prisma.reviewerApplication.create({
      data: {
        userEmail: email,
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
      message: "Registration successful! You can now sign in as a verified reviewer.",
      success: true
    })

  } catch (error) {
    console.error('Error registering reviewer:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

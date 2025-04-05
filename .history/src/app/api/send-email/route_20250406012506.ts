import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

export async function POST(req: Request) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured')
    return NextResponse.json(
      { success: false, message: 'Email service not configured' },
      { status: 500 }
    )
  }

  try {
    const { csvData, subject, body } = await req.json()

    if (!csvData) {
      return NextResponse.json(
        { success: false, message: 'No CSV data provided' },
        { status: 400 }
      )
    }

    // Create email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'creesler@gmail.com',
      subject: subject,
      text: body,
      attachments: [
        {
          filename: `laundry_data_${new Date().toISOString().split('T')[0]}.csv`,
          content: csvData,
          contentType: 'text/csv'
        }
      ]
    }

    // Verify connection configuration
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('SMTP Connection Error:', verifyError)
      return NextResponse.json(
        { success: false, message: 'Failed to connect to email server' },
        { status: 500 }
      )
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      info: info.response
    })
  } catch (error) {
    console.error('Error in email route:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
})

export async function POST(req: Request) {
  try {
    const { csvData, subject, body } = await req.json()

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

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    )
  }
} 
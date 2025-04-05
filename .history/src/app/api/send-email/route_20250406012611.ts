import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function POST(req: Request) {
  try {
    const { csvData, subject, body } = await req.json()

    if (!csvData) {
      return NextResponse.json(
        { success: false, message: 'No CSV data provided' },
        { status: 400 }
      )
    }

    // Create email message
    const msg = {
      to: 'creesler@gmail.com',
      from: 'noreply@laundrykingpos.com', // This needs to be a verified sender in SendGrid
      subject: subject,
      text: body,
      attachments: [
        {
          content: Buffer.from(csvData).toString('base64'),
          filename: `laundry_data_${new Date().toISOString().split('T')[0]}.csv`,
          type: 'text/csv',
          disposition: 'attachment'
        }
      ]
    }

    // Send email
    await sgMail.send(msg)
    console.log('Email sent successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully'
    })
  } catch (error) {
    console.error('Error in email route:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send email',
        error: error.response?.body?.errors || error.message 
      },
      { status: 500 }
    )
  }
} 
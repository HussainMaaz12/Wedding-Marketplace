// src/modules/notifications/notification.service.ts
// Notifications — Mongoose version

import nodemailer from 'nodemailer'
import { connectDB } from '@/lib/db'
import { Notification } from '@/models'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type: string
  link?: string
}) {
  await connectDB()
  return Notification.create(data)
}

export async function getUserNotifications(userId: string, page = 1) {
  await connectDB()
  const limit = 20
  const skip = (page - 1) * limit

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ])

  return { notifications, unreadCount }
}

export async function markAllAsRead(userId: string) {
  await connectDB()
  return Notification.updateMany({ userId, isRead: false }, { isRead: true })
}

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options,
    })
  } catch (error) {
    console.error('Email send failed:', error)
  }
}

export async function sendBookingConfirmedEmail(customerEmail: string, booking: any) {
  await sendEmail({
    to: customerEmail,
    subject: '✅ Booking Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Your Booking is Confirmed!</h2>
        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
        <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString('en-IN')}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking._id}"
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Booking
        </a>
      </div>
    `,
  })
}
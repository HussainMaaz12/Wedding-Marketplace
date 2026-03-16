/**
 * src/lib/email.ts
 * Utility for sending email notifications.
 * Currently uses Console Mocking for Phase 5 development as requested by the user.
 * Can be swapped out for Nodemailer or Resend later.
 */

interface EmailTemplate {
  to: string
  subject: string
  body: string
}

export const sendEmail = async ({ to, subject, body }: EmailTemplate) => {
  // Console Mocking
  console.log('----------------------------------------------------')
  console.log('📧 MOCK EMAIL NOTIFICATION SENT')
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${body}`)
  console.log('----------------------------------------------------')

  // Simulate slight delay to mimic real network request
  await new Promise(resolve => setTimeout(resolve, 500))

  return { success: true }
}

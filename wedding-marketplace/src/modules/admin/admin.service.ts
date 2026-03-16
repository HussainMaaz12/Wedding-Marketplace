// src/modules/admin/admin.service.ts
// Admin controls — Mongoose version

import { connectDB } from '@/lib/db'
import { User, Vendor, Booking, Payout, Coupon, AuditLog } from '@/models'
import { createNotification, sendEmail } from '@/modules/notifications/notification.service'

async function verifyAdmin(adminId: string) {
  const user = await User.findById(adminId)
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized: Admin access required')
  return user
}

export async function approveVendor(adminId: string, vendorId: string) {
  await connectDB()
  await verifyAdmin(adminId)

  const vendor = await Vendor.findById(vendorId).populate('userId', 'name email')
  if (!vendor) throw new Error('Vendor not found')

  await Vendor.findByIdAndUpdate(vendorId, { status: 'APPROVED' })

  const user = vendor.userId as any

  await createNotification({
    userId: vendor.userId.toString(),
    title: '🎉 Your profile is approved!',
    message: 'Your vendor profile is now live on the platform!',
    type: 'VENDOR_APPROVED',
    link: '/vendor/dashboard',
  })

  await sendEmail({
    to: user.email,
    subject: '✅ Your WeddingConnect profile is approved!',
    html: `<h2>Congratulations ${user.name}! Your profile is live.</h2>
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard">Go to Dashboard</a>`,
  })

  await AuditLog.create({ userId: adminId, action: 'VENDOR_APPROVED', entity: 'Vendor', entityId: vendorId })
  return { message: 'Vendor approved' }
}

export async function rejectVendor(adminId: string, vendorId: string, reason: string) {
  await connectDB()
  await verifyAdmin(adminId)

  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    { status: 'REJECTED', rejectionReason: reason },
    { new: true }
  )
  if (!vendor) throw new Error('Vendor not found')

  await createNotification({
    userId: vendor.userId.toString(),
    title: 'Profile Application Update',
    message: `Your application was not approved. Reason: ${reason}`,
    type: 'VENDOR_REJECTED',
  })

  await AuditLog.create({
    userId: adminId, action: 'VENDOR_REJECTED', entity: 'Vendor',
    entityId: vendorId, details: { reason }
  })
  return { message: 'Vendor rejected' }
}

export async function suspendVendor(adminId: string, vendorId: string, reason: string) {
  await connectDB()
  await verifyAdmin(adminId)
  await Vendor.findByIdAndUpdate(vendorId, { status: 'SUSPENDED' })
  await AuditLog.create({
    userId: adminId, action: 'VENDOR_SUSPENDED', entity: 'Vendor',
    entityId: vendorId, details: { reason }
  })
}

export async function toggleFeaturedVendor(adminId: string, vendorId: string) {
  await connectDB()
  await verifyAdmin(adminId)
  const vendor = await Vendor.findById(vendorId)
  if (!vendor) throw new Error('Vendor not found')
  return Vendor.findByIdAndUpdate(vendorId, { isFeatured: !vendor.isFeatured }, { new: true })
}

export async function getAdminStats(adminId: string) {
  await connectDB()
  await verifyAdmin(adminId)

  const [totalVendors, pendingVendors, totalCustomers, totalBookings, commissionAgg, payoutAgg] =
    await Promise.all([
      Vendor.countDocuments({ status: 'APPROVED' }),
      Vendor.countDocuments({ status: 'PENDING' }),
      User.countDocuments({ role: 'CUSTOMER' }),
      Booking.countDocuments(),
      Payout.aggregate([{ $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      Payout.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } },
      ]),
    ])

  return {
    totalVendors, pendingVendors, totalCustomers, totalBookings,
    platformCommission: commissionAgg[0]?.total || 0,
    pendingPayouts: payoutAgg[0]?.total || 0,
  }
}

export async function getPendingVendors(adminId: string, page = 1) {
  await connectDB()
  await verifyAdmin(adminId)

  const limit = 20
  const skip = (page - 1) * limit

  const [vendors, total] = await Promise.all([
    Vendor.find({ status: 'PENDING' })
      .populate('userId', 'name email phone')
      .populate('categoryId', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Vendor.countDocuments({ status: 'PENDING' }),
  ])

  return { vendors, total }
}

export async function processVendorPayout(adminId: string, payoutId: string, utrNumber: string) {
  await connectDB()
  await verifyAdmin(adminId)

  const payout = await Payout.findByIdAndUpdate(
    payoutId,
    { status: 'COMPLETED', utrNumber, processedAt: new Date() },
    { new: true }
  ).populate('vendorId', 'userId')

  if (!payout) throw new Error('Payout not found')

  const vendor = payout.vendorId as any

  await createNotification({
    userId: vendor.userId.toString(),
    title: '💰 Payout Processed!',
    message: `₹${(payout.netAmount ?? payout.amount ?? 0).toLocaleString('en-IN')} transferred. UTR: ${utrNumber}`,
    type: 'PAYOUT_PROCESSED',
  })

  await AuditLog.create({
    userId: adminId, action: 'PAYOUT_PROCESSED', entity: 'Payout',
    entityId: payoutId, details: { utrNumber, amount: payout.netAmount ?? payout.amount }
  })

  return { message: 'Payout processed successfully' }
}

export async function createCoupon(adminId: string, data: {
  code: string; type: 'PERCENTAGE' | 'FIXED'; value: number
  validFrom: string; validUntil: string; minOrderAmount?: number
  maxDiscount?: number; usageLimit?: number; perUserLimit?: number
}) {
  await connectDB()
  await verifyAdmin(adminId)

  const existing = await Coupon.findOne({ code: data.code.toUpperCase() })
  if (existing) throw new Error('Coupon code already exists')

  return Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
    validFrom: new Date(data.validFrom),
    validUntil: new Date(data.validUntil),
  })
}
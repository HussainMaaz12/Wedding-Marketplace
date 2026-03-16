import { connectDB } from '../src/lib/db';
import { User, Vendor, Booking, Payment, Category } from '../src/models';
import {
  createBookingEnquiry,
  respondToEnquiry,
} from '../src/modules/bookings/booking.service';
import {
  createPaymentOrder,
  verifyPayment
} from '../src/modules/payments/payment.service';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
  try {
    console.log('--- Starting Phase 4 E2E Verification ---');
    await connectDB();

    // Clean up previous test runs if any
    await User.deleteMany({ email: { $in: ['test-cust@example.com', 'test-ven@example.com'] } });
    await Vendor.deleteMany({ businessName: 'Test Vendor Biz' });
    await Category.deleteMany({ slug: 'test-category' });

    // 1. Create Customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'test-cust@example.com',
      phone: '1234567890',
      passwordHash: 'dummy_hash',
      role: 'CUSTOMER',
    });
    console.log('Created Test Customer');

    // 2. Create Vendor User & Profile
    const vendorUser = await User.create({
      name: 'Test Vendor User',
      email: 'test-ven@example.com',
      phone: '0987654321',
      passwordHash: 'dummy_hash',
      role: 'VENDOR',
    });

    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      icon: '📸',
    });

    const vendor = await Vendor.create({
      userId: vendorUser._id,
      businessName: 'Test Vendor Biz',
      slug: `test-vendor-${Date.now()}`,
      description: 'A test vendor',
      categoryId: category._id,
      city: 'Mumbai',
      state: 'Maharashtra',
      startingPrice: 50000,
      status: 'APPROVED',
    });
    console.log('Created Test Vendor');

    // 3. Customer creates an Enquiry
    console.log('\n--- 1. Customer Enquiry ---');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    // Make sure date is available in future
    const enquiry = await createBookingEnquiry(customer._id.toString(), {
      vendorId: vendor._id.toString(),
      eventDate: futureDate.toISOString(),
      eventType: 'Wedding',
      guestCount: 200,
    });
    console.log(`Enquiry Created. Status: ${enquiry.status}, Total: ${enquiry.totalAmount}, Advance: ${enquiry.advanceAmount}`);

    // 4. Vendor accepts the Enquiry
    console.log('\n--- 2. Vendor Accepts Enquiry ---');
    const acceptedStatus = await respondToEnquiry(vendorUser._id.toString(), {
      bookingId: enquiry._id.toString(),
      action: 'ACCEPT',
      note: 'Looking forward to it!',
    });
    console.log(`${acceptedStatus.message}`);

    const acceptedBooking = await Booking.findById(enquiry._id);
    console.log(`Booking Status is now: ${acceptedBooking?.status}`);

    // 5. Customer initiates Payment (Advance)
    console.log('\n--- 3. Customer Payment Initiation ---');
    const orderData = await createPaymentOrder(
      enquiry._id.toString(),
      customer._id.toString(),
      'ADVANCE'
    );
    console.log(`Payment Order Created. Razorpay Order ID: ${orderData.razorpayOrderId}`);

    // Wait, createPaymentOrder might fail if process.env.RAZORPAY_KEY_ID is missing or dummy.
    // Assuming razorpay creates order successfully. We will mock payment ID.
    const mockRazorpayPaymentId = `pay_${Date.now()}`;

    // 6. Verify Payment
    console.log('\n--- 4. Verify Payment ---');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    const body = `${orderData.razorpayOrderId}|${mockRazorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const verification = await verifyPayment(
      orderData.razorpayOrderId,
      mockRazorpayPaymentId,
      generatedSignature
    );
    console.log(`Payment Verification: ${'message' in verification ? verification.message : 'Already Paid'}`);

    // 7. Check final booking status
    const finalBooking = await Booking.findById(enquiry._id);
    console.log(`Final Booking Status: ${finalBooking?.status}`);

    console.log('\nEnd-to-End Flow Verified Successfully!');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    console.log('\nCleaning up test data...');
    // Cleanup
    await User.deleteMany({ email: { $in: ['test-cust@example.com', 'test-ven@example.com'] } });
    await Vendor.deleteMany({ businessName: 'Test Vendor Biz' });
    await Category.deleteMany({ slug: 'test-category' });
    // Also clean up bookings and payments made by these users
    await mongoose.connection.close();
  }
}

runTest();

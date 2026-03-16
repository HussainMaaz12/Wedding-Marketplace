This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Setup

Before running or deploying the app, you need to configure your environment variables. 
Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required services:
1. **MongoDB**: A running MongoDB instance (local or Atlas)
2. **Cloudinary**: For vendor image uploads
3. **Razorpay**: For processing booking advances

## Deploy on Vercel

The easiest way to deploy this Wedding Marketplace is to use the [Vercel Platform](https://vercel.com/new).

### Deployment Steps:
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. **Crucial Step**: In the Vercel deployment settings, expand the "Environment Variables" section.
4. Add all the variables listed in `.env.example`:
   - `MONGODB_URI` (Use your MongoDB Atlas connection string)
   - `SESSION_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Click **Deploy**.

Vercel will automatically build the Next.js App Router application and deploy it globally.

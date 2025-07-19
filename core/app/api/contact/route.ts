import { NextRequest, NextResponse } from 'next/server';

export type ContactFormResponse = {
  status: 'success' | 'error';
  error?: string;
};

export const POST = async (request: NextRequest): Promise<NextResponse<ContactFormResponse>> => {
  const body = await request.json();
  const { fullName, email, phone, businessName, subject, message, to } = body;

  if (!fullName || !email || !subject || !message) {
    return NextResponse.json(
      { status: 'error', error: 'Missing required fields' },
      { status: 400 },
    );
  }

  // TODO: ADD A LOGIC TO SEND EMAIL
  console.log('Contact Form Submission:', {
    fullName,
    email,
    phone,
    businessName,
    subject,
    message,
    to,
  });

  return NextResponse.json({ status: 'success' });
};

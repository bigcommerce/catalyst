import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export type ContactFormResponse = {
  status: 'success' | 'error';
  error?: string;
};

const fetchAccessTokenForCreatingAContact = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `${process.env.CONTACT_API_BASE_URL}/security/token/v2`,
      {
        username: process.env.CONTACT_API_USERNAME,
        password: process.env.CONTACT_API_PASSWORD,
        grant_type: 'password',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (response.data && response.data.AccessToken) {
      return response.data.AccessToken;
    } else {
      throw new Error('Access token not found in response');
    }
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Failed to fetch access token');
  }
};

const createAContact = async (
  fullName: string,
  email: string,
  phone: string,
  businessName: string,
  subject: string,
  message: string,
  to: string,
): Promise<void> => {
  const accessToken = await fetchAccessTokenForCreatingAContact();

  try {
    const response = await axios.post(
      `${process.env.CONTACT_API_BASE_URL}/entity/contacts`,
      {
        FirstName: fullName.split(' ')[0],
        LastName: fullName.split(' ')[1],
        DirectPhone: phone,
        AddressId: 15341,
        EmailAddress: email,
        Title: subject,
        Comments: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    throw new Error('Failed to create contact');
  }
};

const sendFormSpreeEmail = async (
  fullName: string,
  email: string,
  phone: string,
  businessName: string,
  subject: string,
  message: string,
): Promise<void> => {
  try {
    const response = await axios.post(`${process.env.FORM_SPREE_URL}`, {
      name: 'Contact Form Submission',
      fullName,
      email,
      phone,
      businessName,
      subject,
      message,
    });
  } catch (error) {
    console.error('Error sending Formspree email:', error);
    throw new Error('Failed to send Formspree email');
  }
};

export const POST = async (request: NextRequest): Promise<NextResponse<ContactFormResponse>> => {
  const body = await request.json();
  const { firstName, lastName, email, phone, businessName, subject, message, to } = body;

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json(
      { status: 'error', error: 'Missing required fields' },
      { status: 400 },
    );
  }

  await createAContact(
    `${firstName} ${lastName}`,
    email,
    phone || '',
    businessName || '',
    subject,
    message,
    to || '',
  );

  await sendFormSpreeEmail(
    `${firstName} ${lastName}`,
    email,
    phone || '',
    businessName || '',
    subject,
    message,
  );

  return NextResponse.json({ status: 'success' });
};

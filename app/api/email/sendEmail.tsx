// pages/api/sendEmail.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, company, email, phoneNumber, message } = req.body;

    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password
      },
    });

    // Send mail with defined transport object
    try {
      await transporter.sendMail({
        from: '"Contact Form" <your-email@example.com>', // sender address
        to: 'recipient-email@example.com', // list of receivers
        subject: 'New Contact Form Submission', // Subject line
        html: `<p><strong>First Name:</strong> ${firstName}</p>
               <p><strong>Last Name:</strong> ${lastName}</p>
               <p><strong>Company:</strong> ${company}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Phone Number:</strong> ${phoneNumber}</p>
               <p><strong>Message:</strong> ${message}</p>`, // html body
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

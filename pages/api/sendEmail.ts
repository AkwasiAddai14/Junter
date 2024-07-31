// pages/api/sendEmail.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, company, email, phoneNumber, message } = req.body;

    // Ensure environment variables are defined
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailHost || !emailPort || !emailUser || !emailPass) {
      console.error('Missing environment variables for email configuration');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort, 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser, // your email address
        pass: emailPass, // your email password
      },
    });

    // Send mail with defined transport object
    try {
      await transporter.sendMail({
        from: `"Contact Form" <${emailUser}>`, // sender address
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

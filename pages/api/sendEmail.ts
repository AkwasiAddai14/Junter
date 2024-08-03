// pages/api/sendEmail.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { firstName, lastName, company, email, phoneNumber, message } = req.body;
  
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = process.env.EMAIL_PORT;
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
  
      if (!emailHost || !emailPort || !emailUser || !emailPass) {
        console.error('Missing environment variables for email configuration');
        return res.status(500).json({ message: 'Server configuration error' });
      }
  
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
  
      try {
        await transporter.sendMail({
          from: `"Contact Form" <${emailUser}>`,
          to: 'support@junter.works',
          subject: 'New Contact Form Submission',
          html: `<p><strong>First Name:</strong> ${firstName}</p>
                 <p><strong>Last Name:</strong> ${lastName}</p>
                 <p><strong>Company:</strong> ${company}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                 <p><strong>Message:</strong> ${message}</p>`,
        });
  
        res.status(200).json({ message: 'Email sent successfully' });
      } catch (error: any) {  // Change the type of error to any
        console.error('Error sending email:', error.message || error);
        res.status(500).json({ message: `Error sending email: ${error.message || error}` });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
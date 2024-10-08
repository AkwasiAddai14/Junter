// pages/api/sendEmail.ts

import { haalFreelancer } from '@/app/lib/actions/freelancer.actions';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { clerkId,  message } = req.body;
        let freelancer;
      try {
        freelancer = await haalFreelancer(clerkId as string);
        res.status(200).json(freelancer);
        console.log(freelancer)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }

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
          subject: 'Verzoek om account te verwijderen',
          html: `<p><strong>De volgende freelancer wilt zijn account verwijderen: </strong> ${freelancer}</p>
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
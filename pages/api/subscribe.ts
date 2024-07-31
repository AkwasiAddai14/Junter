// pages/api/subscribe.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import Email from '@/app/lib/models/email.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    await connectToDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const newEmail = new Email({ email });
      await newEmail.save();
      res.status(201).json({ message: 'Email saved successfully' });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

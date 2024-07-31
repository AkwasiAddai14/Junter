// pages/api/subscribe.js

import nextConnect from 'next-connect';
import {connectToDB} from '@/app/lib/mongoose';
import Email from '@/app/lib/models/email.model';

const handler = nextConnect();

handler.post(async (req: { body: { email: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; }): void; new(): any; }; }; }) => {
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
});

export default handler;

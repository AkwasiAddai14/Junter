import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';

import { haalFacturen } from '@/app/lib/actions/factuur.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET') {
        try {
            const shifts = await haalFacturen();
            res.status(200).json(shifts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch shifts' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { haalAlleShifts } from '@/app/lib/actions/shiftArray.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET') {
        try {
            const shifts = await haalAlleShifts();
            res.status(200).json(shifts);
            console.log(shifts)
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch shifts' });
        }
    }
}
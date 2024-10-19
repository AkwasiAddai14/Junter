import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { haalAlleShifts } from '@/app/lib/actions/shiftArray.actions';
import { haalEnkeleShift } from '@/app/lib/actions/shift.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET' || req.method === 'POST') {
        const { id, action } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
          }

    if (action || typeof action === 'string') {
        try {
                const shift = await haalEnkeleShift(id as string);
                return shift;
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch shifts' });
            }
            return res.status(400).json({ error: 'Invalid or missing action' });
        } else {
            const shifts = await haalAlleShifts();
                res.status(200).json(shifts);
                console.log(shifts)
        } 
    }
}
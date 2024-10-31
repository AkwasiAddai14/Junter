import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { filterShift } from '@/app/lib/actions/shift.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET' || req.method === 'POST') {
        const { tarief, afstand, opdrachtgever, id} = req.body
        try {

             const shifts = await filterShift({tarief, range: afstand, id});
             return shifts;
            } catch (error) {
                res.status(500).json({ error: 'Failed to update shifts' });
            }
            return res.status(400).json({ error: 'Invalid or missing action' });
        } 
        else {
                res.status(400).json({ error: 'Invalid or missing action' });
        } 
}
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { cloudShifts } from '@/app/lib/actions/shiftArray.actions';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET' || req.method === 'POST') {
        
        try {

             await cloudShifts();
         
            return res.status(200).json( 'Updated shifts succesfully' );

            } catch (error) {
                res.status(500).json({ error: 'Failed to update shifts' });
            }
            return res.status(400).json({ error: 'Invalid or missing action' });
        } 
        else {
                res.status(400).json({ error: 'Invalid or missing action' });
        } 
}
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { currentUser } from '@clerk/nextjs/server';

import { haalFacturenFreelancer } from '@/app/lib/actions/factuur.actions';
import { haalFreelancer } from '@/app/lib/actions/freelancer.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();
    const user = await currentUser()
    const id = await haalFreelancer(user!.id)


    if (req.method === 'GET') {
        const { clerkId } = req.query;
        let shifts;
        try {
            if(id){
                shifts = await haalFacturenFreelancer(id);
            } else {
                if (typeof clerkId !== 'string') {
                    throw new Error('Invalid clerkId, expected a string');
                }
                shifts = await haalFacturenFreelancer(clerkId);
            }
            
            res.status(200).json(shifts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch shifts' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
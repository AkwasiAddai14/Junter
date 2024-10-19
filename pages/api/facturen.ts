import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { currentUser } from '@clerk/nextjs/server';

import { haalAfgerondeShifts, haalFacturenFreelancer, haalInShiftsFacturen } from '@/app/lib/actions/factuur.actions';
import { haalFreelancer } from '@/app/lib/actions/freelancer.actions';
import { Types } from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();
    const user = await currentUser()
    const id = await haalFreelancer(user!.id)


    if (req.method === 'GET' || req.method === 'POST') {
        const {clerkId, factuurId, action } = req.query; 
        
        if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }

        if (!action || typeof action !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing action' });
        }
        let shifts;
        let facturen;
        try {
            switch (action) {
                case 'haalAfgerondeShifts':
                    try {
                        shifts = await haalAfgerondeShifts(clerkId as string);
                        return shifts;
                    } catch (error: any){

                    }
                case 'haalFacturen' :
                    try {
                        facturen = await haalFacturenFreelancer(clerkId as string);
                        return facturen;
                    } catch (error: any) {

                    }
                case 'haalShifts':
                    try {
                        facturen = await haalInShiftsFacturen(factuurId);
                        return facturen;
                    } catch (error: any) {
                        res.status(500).json({ error: 'Failed to fetch shifts' });
                    }
                default:
                res.status(400).json({ error: 'Invalid action' });
                break;
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
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { fetchBedrijfByClerkId } from '@/app/lib/actions/bedrijven.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET' || req.method === 'POST') {
        const { clerkId } = req.query; // Get clerkId from query parameters

    if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }
        try {
            const shifts = await fetchBedrijfByClerkId(clerkId as string);
            res.status(200).json(shifts);
            console.log(shifts)
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch shifts' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
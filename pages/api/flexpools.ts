
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { useUser } from '@clerk/nextjs';
import { haalFlexpool } from '@/app/lib/actions/flexpool.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {user, isLoaded} = useUser()

    const userid = user?.id;
    await connectToDB();

    if (req.method === 'GET') {
        try {
            const shifts = await haalFlexpool(userid as string);
            res.status(200).json(shifts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch shifts' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
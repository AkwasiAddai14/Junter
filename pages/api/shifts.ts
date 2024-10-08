import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { haalShifts } from '@/app/lib/actions/shiftArray.actions';
import { annuleerAanmeldingen, haalAangemeld, reageerShift } from '@/app/lib/actions/shift.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET') {
        const { clerkId, shiftArrayId, action } = req.query; // Get clerkId from query parameters

    if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }

    if (!action || typeof action !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing action' });
        }

        switch (action) {
            case 'haalShifts':
                try {
                    const shifts = await haalShifts(clerkId as string);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
                break;
            case 'HaalAangemeld':
                try {
                    const shifts = await haalAangemeld(clerkId as string);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
                break;
            case 'aanmelden':
                try {
                    if (typeof shiftArrayId !== 'string') {
                        throw new Error('Invalid shiftArrayId, expected a string');
                    }

                    if (typeof clerkId !== 'string') {
                        throw new Error('Invalid clerkId, expected a string');
                    }
                    
                    const shifts = await reageerShift({ shiftArrayId, freelancerId: clerkId });
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
                break;
            case 'afmelden':
                try {
                    if (typeof shiftArrayId !== 'string') {
                        throw new Error('Invalid shiftArrayId, expected a string');
                    }

                    if (typeof clerkId !== 'string') {
                        throw new Error('Invalid clerkId, expected a string');
                    }
                    
                    const shifts = await annuleerAanmeldingen({shiftArrayId, freelancerId: clerkId});
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
            break;
            default:
                res.status(400).json({ error: 'Invalid action' });
                break;
        } 
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
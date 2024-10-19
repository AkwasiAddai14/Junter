
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { useUser } from '@clerk/nextjs';
import { haalFlexpoolFreelancer, haalShiftsInFlexpool } from '@/app/lib/actions/flexpool.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();
  
    if (req.method === 'GET' || req.method === 'POST') {
      const {clerkId, flexpoolId, action } = req.query; // Get clerkId from query parameters
  
      if (!clerkId) {
        return res.status(400).json({ error: 'clerkId is required' });
      }
      switch(action){
        case 'haalflexpool':
          try {
            const shifts = await haalFlexpoolFreelancer(clerkId as string); // Use clerkId
            res.status(200).json(shifts);
          } catch (error) {
            res.status(500).json({ error: 'Failed to fetch flexpools' });
          }
        case 'haalshifts':
          try {
            const shifts = await haalShiftsInFlexpool(flexpoolId as string); // Use clerkId
            res.status(200).json(shifts);
          } catch (error) {
            res.status(500).json({ error: 'Failed to fetch flexpools' });
          }
          default:
            res.status(400).json({ error: 'Invalid action' });
            break;
        }
      }
      else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
  }
  
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { haalFreelancer, updateAdres, updateBio, updateKorregeling, updateOpleiding, updateProfielfoto, updateTelefoonnummer, updateWerkervaring } from '@/app/lib/actions/freelancer.actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDB();

    if (req.method === 'GET') {
       
  const { clerkId, action } = req.query; // Get clerkId and actie from query parameters
  const { value } = req.body; // Get bio from the request body
  

    if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }
        switch(action){
            case 'haalFreelancer':
                try {
                    const freelancer = await haalFreelancer(clerkId as string || value);
                    res.status(200).json(freelancer);
                    console.log(freelancer)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
            break;

            case 'updateBio': 
                try {
                    const shifts = await updateBio(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update bio' });
                }
            break;

            case 'updateProfielFoto':
                try {
                    const shifts = await updateProfielfoto(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to profielfoto' });
                }
            break;

            case 'updateOpleiding':
                try {
                    const shifts = await updateOpleiding(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update vaardigheden' });
                }
            break;

            case 'updateWerkervaring':
                try {
                    const shifts = await updateWerkervaring(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update werkervaring' });
                }
            break;

            case 'updateAdres':
                try {
                    const shifts = await updateAdres(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update address' });
                }
            break;

            case 'updateKorRegeling':
                try {
                    const shifts = await updateKorregeling(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update korregeling' });
                }
            break;

            case 'updateTelefoonnummer':
                try {
                    const shifts = await updateTelefoonnummer(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update phone number' });
                }
            break;

            case 'maakFreelancer':
                try {
                    const shifts = await updateTelefoonnummer(clerkId as string, value);
                    res.status(200).json(shifts);
                    console.log(shifts)
                } catch (error) {
                    res.status(500).json({ error: 'Failed to update phone number' });
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
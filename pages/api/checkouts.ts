import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/app/lib/mongoose';
import { useUser } from "@clerk/nextjs"
import { haalcheckout, noShowCheckout, vulCheckout } from '@/app/lib/actions/checkout.actions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    await connectToDB();
    const { shiftId, action } = req.query;
    const { values } =req.body;
    const shiftIdParam = Array.isArray(shiftId) ? shiftId[0] : shiftId || ''; 
    
    if (req.method === 'GET' || req.method === 'POST') {
        
        switch(action){
            case 'haalcheckout':
                try {
                    const shifts = await haalcheckout({shiftId: shiftIdParam} );
                    res.status(200).json(shifts);
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }  
        }
    } 
    if (req.method === 'POST') {
        switch(action){
            case 'vulcheckout':
                try {
                    const checkoutResult = await vulCheckout({
                        shiftId: values.shiftId,
                        rating: values.rating,
                        begintijd: values.begintijd,
                        eindtijd: values.eindtijd,
                        pauze: values.pauze || "",
                        feedback: values.feedback || "",
                        opmerking: values.opmerking || "",
                      });
                    res.status(200).json(checkoutResult);
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
            case 'noshow':
                try {
                    const Checkout = await noShowCheckout({shiftId: shiftIdParam});
                    res.status(200).json(Checkout);
                } catch (error) {
                    res.status(500).json({ error: 'Failed to fetch shifts' });
                }
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
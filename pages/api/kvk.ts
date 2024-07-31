// pages/api/kvk.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { kvkNummer } = req.query;
  
  if (!kvkNummer || typeof kvkNummer !== 'string') {
    return res.status(400).json({ error: 'Invalid KVK number' });
  }
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_KVK_API_KEY;
    const url = `https://api.kvk.nl/api/v2/zoeken?kvkNummer=${kvkNummer}`;
    
    // Logging the request being made
    console.log(`Requesting KVK data for number: ${kvkNummer}`);
    
    const response = await axios.get(url, {
      headers: {
        'apikey': apiKey,
      }
    });
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      const companyData = response.data.items[0];
      const address = companyData.adres;
      const companyName = companyData.handelsnaam;
      const streetName = address.straatnaam;
      const houseNumber = address.huisnummer;
      const houseNumberAddition = address.huisnummerToevoeging || '';
      const houseLetter = address.huisletter || '';
      const postalCode = address.postcode;
      const place = address.plaats;
  
      return res.status(200).json({
        companyName,
        streetName,
        houseNumber,
        houseNumberAddition,
        houseLetter,
        postalCode,
        place
      });
    } else {
      console.log('No company data found for the provided KVK number.');
      return res.status(404).json({ error: 'No company data found for the provided KVK number.' });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      console.error('Error fetching company details:', axiosError.message);
      return res.status(axiosError.response?.status || 500).json({ error: 'Failed to fetch company details', details: axiosError.message });
    } else {
      console.error('Error fetching company details:', error);
      return res.status(500).json({ error: 'Failed to fetch company details', details: (error as Error).message });
    }
  }
}

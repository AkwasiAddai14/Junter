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
    const searchUrl = `https://api.kvk.nl/api/v2/search/companies?q=${kvkNummer}&start=0&rows=1`;
    const profileUrl = `https://api.kvk.nl/api/v1/basisprofielen/${kvkNummer}`;

    // Logging the request being made
    console.log(`Requesting KVK data for number: ${kvkNummer}`);

    // First, search for the company
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'apikey': apiKey,
      }
    });

    if (searchResponse.data && searchResponse.data.items && searchResponse.data.items.length > 0) {
      // If the company is found, fetch the detailed profile
      const profileResponse = await axios.get(profileUrl, {
        headers: {
          'apikey': apiKey,
        }
      });

      if (profileResponse.data) {
        const companyData = profileResponse.data;
        const address = companyData.adressen ? companyData.adressen[0] : {};
        const companyName = companyData.handelsnaam || '';
        const streetName = address.straatnaam || '';
        const houseNumber = address.huisnummer || '';
        const houseNumberAddition = address.huisnummerToevoeging || '';
        const houseLetter = address.huisletter || '';
        const postalCode = address.postcode || '';
        const place = address.plaats || '';

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
        console.log('No detailed company data found for the provided KVK number.');
        return res.status(404).json({ error: 'No detailed company data found for the provided KVK number.' });
      }
    } else {
      console.log('No company data found for the provided KVK number.');
      return res.status(404).json({ error: 'No company data found for the provided KVK number.' });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching company details:', error.message);
      return res.status(error.response?.status || 500).json({ error: 'Failed to fetch company details', details: error.message });
    } else {
      console.error('Error fetching company details:', error);
      return res.status(500).json({ error: 'Failed to fetch company details', details: (error as Error).message });
    }
  }
}

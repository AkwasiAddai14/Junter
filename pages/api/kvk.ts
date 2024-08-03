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
    const searchUrl = `https://api.kvk.nl/api/v2/zoeken?kvkNummer=${kvkNummer}&pagina=1&resultatenPerPagina=1`;
    const profileUrl = `https://api.kvk.nl/api/v1/basisprofielen/${kvkNummer}`;

    // Logging the request being made
    console.log(`Requesting KVK data for number: ${kvkNummer}`);
    console.log(`Search URL: ${searchUrl}`);
    console.log(`Profile URL: ${profileUrl}`);

    // First, search for the company
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'apikey': apiKey,
      }
    });

    console.log('Search Response:', searchResponse.data);

    if (searchResponse.data && searchResponse.data.resultaten && searchResponse.data.resultaten.length > 0) {
      // If the company is found, fetch the detailed profile
      const profileResponse = await axios.get(profileUrl, {
        headers: {
          'apikey': apiKey,
        }
      });

      console.log('Profile Response:', profileResponse.data);

      if (profileResponse.data) {
        const companyData = profileResponse.data;
        const mainAddress = companyData._embedded.hoofdvestiging.adressen ? companyData._embedded.hoofdvestiging.adressen[0] : {};
        const companyName = companyData.naam || '';
        const streetName = mainAddress.straatnaam || '';
        const houseNumber = mainAddress.huisnummer || '';
        const houseNumberAddition = mainAddress.huisnummerToevoeging || '';
        const houseLetter = mainAddress.huisletter || '';
        const postalCode = mainAddress.postcode || '';
        const place = mainAddress.plaats || '';

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
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      return res.status(error.response?.status || 500).json({ error: 'Failed to fetch company details', details: error.message });
    } else {
      console.error('Error fetching company details:', error);
      return res.status(500).json({ error: 'Failed to fetch company details', details: (error as Error).message });
    }
  }
}

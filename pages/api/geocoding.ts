import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { adres } = req.query;

    // Validate the address
    if (!adres || typeof adres !== 'string') {
        return res.status(400).json({ error: 'Invalid GEOCODE number' });
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEOCODE_API_KEY;
      if (!apiKey) {
          console.error('API Key is missing.');
          return res.status(500).json({ error: 'Geocoding API key is missing' });
      }
      const searchUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=adres&key=${apiKey}`;

        console.log(`Requesting coordinates data for adres: ${adres}`);
        console.log(`Search URL: ${searchUrl}`);

        // Fetch data from Google Maps Geocoding API
        const searchResponse = await axios.get(searchUrl);

        console.log('Search Response:', searchResponse.data);

        // Check if there are any results in the response
        if (searchResponse.data.status === 'ZERO_RESULTS') {
          console.log('No coordinates found for the provided address.');
          return res.status(404).json({ error: 'No coordinates found for the provided address.' });
      } else if (searchResponse.data.status !== 'OK') {
          console.log(`Geocoding API error: ${searchResponse.data.status}`);
          return res.status(500).json({ error: 'Error with Geocoding API', status: searchResponse.data.status });
      }

      // Extract coordinates from the response
      if (searchResponse.data.results && searchResponse.data.results.length > 0) {
          const coordinates = searchResponse.data.results[0].geometry.location;
          return res.status(200).json({
              latitude: coordinates.lat,
              longitude: coordinates.lng
          });
      } else {
          console.log('No coordinates found for the provided address.');
          return res.status(404).json({ error: 'No coordinates found for the provided address.' });
      }

  } catch (error) {
      if (axios.isAxiosError(error)) {
          console.error('Error fetching coordinates:', error.message);
          if (error.response) {
              console.error('Response data:', error.response.data);
              console.error('Response status:', error.response.status);
          } else if (error.request) {
              console.error('Request data:', error.request);
          } else {
              console.error('Error message:', error.message);
          }
          return res.status(error.response?.status || 500).json({ error: 'Failed to fetch coordinates', details: error.message });
      } else {
          console.error('Unknown error:', error);
          return res.status(500).json({ error: 'Failed to fetch coordinates', details: (error as Error).message });
      }
  }
}
import axios from 'axios';

export default async function handler(req: { query: { postcode: any; huisnummer: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) {
  const { postcode, huisnummer } = req.query;

  try {
    const apiKey = process.env.NEXT_PUBLIC_POSTCODE_API_KEY;
    const url = `https://api.postcodeapi.nu/v3/lookup/${postcode}/${huisnummer}`;

    const response = await axios.get(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    res.status(200).json(response.data);
  } catch (error:any) {
    console.error('Error fetching address data:', error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}

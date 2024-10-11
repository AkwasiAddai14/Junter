import { z } from 'zod';

export const ProfielValidation = z.object({
   
    telefoonnummer: z.string().optional(),
    emailadres: z.string().optional(),
    korregeling: z.boolean().optional(),
    bsn: z.string().optional(),
    btwid: z.string().optional(),
    iban: z.string().optional(),
    postcode: z.string().optional(),
    profielfoto: z.string().optional(), // Assuming this is processed elsewhere and you have the URL or path as a string
    cv: z.string().optional(), // Assuming this is processed elsewhere and you have the URL or path as a string
    bio: z.string().optional(),
    kvk: z.string().optional(),

});
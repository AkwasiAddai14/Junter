import * as z from 'zod';

export const ShiftValidation = z.object({
    opdrachtgever: z.string(),
    afbeelding: z.string().url(),
    titel: z.string(),
    uurtarief: z.number().gt(15),
    datum: z.date(),
    adres: z.string(),
    begintijd: z.string(),
    eindtijd: z.string(),
    pauze: z.number(),
    plekken: z.number().gt(1),
    beschrijving: z.string(),
    vaardigheden: z.string(),
    kledingsvoorschriften: z.string(),
    beschikbaar: z.boolean().default(true),
    geplubliceerd: z.boolean().default(false)
})
import * as z from 'zod';

export const ShiftValidation = z.object({
    afbeelding: z.string(),
    titel: z.string(),
    functie: z.string(),
    uurtarief: z.number().gt(13),
    begindatum: z.date(),
    einddatum: z.date(),
    adres: z.string(),
    begintijd: z.string(),
    eindtijd: z.string(),
    pauze: z.string(),
    plekken: z.number().gt(0),
    beschrijving: z.string(),
    vaardigheden: z.string(),
    kledingsvoorschriften: z.string(),
    inFlexpool: z.boolean(),
    flexpoolId: z.string(),
})
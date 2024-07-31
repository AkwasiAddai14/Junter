import * as z from 'zod';

export const CheckoutValidation = z.object({
    begintijd: z.string(),
    eindtijd: z.string(),
    pauze: z.string(),
    rating: z.number(),
    feedback: z.string(),
    opmerking: z.string()
})
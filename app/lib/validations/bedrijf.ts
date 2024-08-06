import { z } from 'zod';

export const BedrijfValidation = z.object({
    bedrijvenID: z.string(),
    naam: z.string(),
    profielfoto: z.string().optional(),
    displaynaam: z.string().min(2, "Voer een geldige displaynaam in"),
    bio: z.string().min(2, "Bio moet minimaal een zin lang zijn."),
    kvknr: z.string().min(8, "Onjuist KVK nummer."),
    btwnr: z.string(),
    postcode: z.string(),
    huisnummer: z.string(),
    straat: z.string(),
    stad: z.string(),
    telefoonnummer: z.string(),
    emailadres: z.string(),
    iban: z.string(),
    path: z.string()
})
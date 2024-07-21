import { z } from 'zod';

export const BedrijfValidation = z.object({
    bedrijvenID: z.string(),
    naam: z.string().min(2, "Naam moet minstens twee characters lang zijn").max(100, " en mag maximaal 100 characters lang zijn."),
    profielfoto: z.string().url(),
    displaynaam: z.string().min(2, "Voer een geldige displaynaam in"),
    bio: z.string().min(2, "Bio moet minimaal een zin lang zijn."),
    kvknr: z.string().min(8, "Onjuist KVK nummer."),
    btwnr: z.string().min(12, "Onjuist BTW-ID nummer"),
    postcode: z.string().min(6, "Voer een geldig postcode in."),
    huisnummer: z.string(),
    straat: z.string(),
    stad: z.string(),
    telefoonnummer: z.string().min(10, "Voer een geldig telefoonnummer in."),
    emailadres: z.string().email("Onjuist emailadres"),
    iban: z.string().min(18, "Voer een geldig IBAN in."),
    path: z.string()
})
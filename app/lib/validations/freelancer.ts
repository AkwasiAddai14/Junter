import { z } from 'zod';

export const FreelancerValidation = z.object({
freelancerID: z.string(),
voornaam: z.string().min(1, "Voornaam is vereist!"),
tussenvoegsel: z.string(),
achternaam: z.string().min(1, "Achternaam is vereist!"),
geboortedatum: z.string(),
telefoonnummer: z.string().min(10, "Voer een juist telefoonnummer in."),
emailadres: z.string().min(1, "emailadres is vereist").email('Onjuist emailadres.'),
korregeling: z.boolean(),
bsn: z.string().min(12, "voer een geldig BSN-nummer in."),
btwid: z.string().min(12, "voer een geldig BTW-ID nummer in."),
iban: z.string().min(18, "Voer een geldig IBAN in."),
postcode: z.string().min(6, "Voer een geldig postcode in."),
huisnummer: z.string(),
stad: z.string(),
straatnaam: z.string(),
profielfoto: z.string().url(),
cv: z.string().url(),
bio: z.string(),
path: z.string()
})

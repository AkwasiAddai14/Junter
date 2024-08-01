import { z } from 'zod';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const ACCEPTED_FILE_TYPES = ['image/*']; // Adjusted based on error message

const MAX_FILE_SIZE = 5000000; // 5MB

function checkFileType(file: File) {
    if (file?.name) {
        const fileType = file.name.split(".").pop();
        if (fileType === "docx" || fileType === "pdf") return true;
    }
    return false;
}

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
    kvk: z.string(),
    huisnummer: z.string(),
    stad: z.string(),
    straatnaam: z.string(),
    profielfoto: z.instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_UPLOAD_SIZE, 'File size must be less than 3MB')
        .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), 'File must be a PNG'),
    cv: z.instanceof(File)
        .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
        .refine((file) => checkFileType(file), "Only .pdf, .docx formats are supported."),
    bio: z.string(),
    path: z.string()
});

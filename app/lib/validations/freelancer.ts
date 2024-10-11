import { z } from 'zod';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg']; // Corrected to specific MIME types

const MAX_FILE_SIZE = 5000000; // 5MB

function checkFileType(fileName: string) {
    const fileType = fileName.split(".").pop();
    return fileType === "docx" || fileType === "pdf";
}

export const FreelancerValidation = z.object({
    freelancerID: z.string(),
    voornaam: z.string().min(1, "Voornaam is vereist!"),
    tussenvoegsel: z.string().optional(),
    achternaam: z.string().min(1, "Achternaam is vereist!"),
    geboortedatum: z.date(),
    telefoonnummer: z.string().optional(),
    emailadres: z.string().optional(),
    korregeling: z.boolean().optional(),
    bsn: z.string().optional(),
    btwid: z.string().optional(),
    iban: z.string().min(18, "Voer een geldig IBAN in."),
    postcode: z.string().min(6, "Voer een geldig postcode in."),
    huisnummer: z.string(),
    stad: z.string(),
    straatnaam: z.string(),
    profielfoto: z.string().optional(), // Assuming this is processed elsewhere and you have the URL or path as a string
    cv: z.string().optional(), // Assuming this is processed elsewhere and you have the URL or path as a string
    bio: z.string().optional(),
    path: z.string(),
    kvk: z.string().optional(),
});


"use server"

import  { Document, Types } from 'mongoose';
import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
import fs from 'fs';
import path from 'path';
import Checkout from '../models/checkout.model';
import Factuur from '../models/factuur.model';
import cron from 'node-cron';



interface FactuurParams {
    shiftId: string;
}

export async function maakFactuur({ shiftId }: FactuurParams) {
    try {
        // Fetch checkout information
        const checkout = await Checkout.findOne({ shift: shiftId })
            .populate('opdrachtgever')
            .populate('opdrachtnemer')
            .populate('shift');

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtgever = checkout.opdrachtgever;
        const opdrachtnemer = checkout.opdrachtnemer;
        const shift = checkout.shift;

        // Calculate total amount to be paid
        const workedHours = (new Date(checkout.eindtijd).getTime() - new Date(checkout.begintijd).getTime()) / (1000 * 60 * 60) - (checkout.pauze || 0) / 60;
        const totalAmount = workedHours * shift.uurtarief * 1.21;

        // Create a PDF document
        const doc = new PDFDocument();

        // Define file path
        const filePath = path.join(__dirname, `../../invoices/${shiftId}.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        // Add content to the PDF
        doc.fontSize(20).text('Factuur', { align: 'center' });

        doc.moveDown();
        doc.fontSize(12).text(`Opdrachtgever:`);
        doc.text(`Naam: ${opdrachtgever.naam}`);
        doc.text(`Adres: ${opdrachtgever.adres}`);
        doc.text(`KVK Nummer: ${opdrachtgever.kvknr}`);

        doc.moveDown();
        doc.text(`Opdrachtnemer:`);
        doc.text(`Naam: ${opdrachtnemer.naam}`);
        doc.text(`Adres: ${opdrachtnemer.adres}`);
        doc.text(`IBAN: ${opdrachtnemer.iban}`);
        doc.text(`BTW Nummer: ${opdrachtnemer.btwnr}`);

        doc.moveDown();
        doc.text(`Shift Details:`);
        doc.text(`Titel: ${shift.titel}`);
        doc.text(`Begintijd: ${checkout.begintijd}`);
        doc.text(`Eindtijd: ${checkout.eindtijd}`);
        doc.text(`Pauze: ${checkout.pauze || 0} minuten`);
        doc.text(`Uurtarief: ${checkout.tarief}`)
        doc.text("BTW-tarief: 21%")

        doc.moveDown();
        doc.fontSize(14).text(`Te ontvangen bedrag: €${totalAmount.toFixed(2)}`, { align: 'right' });

        // Finalize the PDF and end the stream
        doc.end();

        console.log('Invoice created successfully.');
    } catch (error: any) {
        throw new Error(`Failed to create invoice: ${error.message}`);
    }
}


// Define an interface representing the document in MongoDB
interface CheckoutDoc extends Document {
    opdrachtgever: Types.ObjectId;
    opdrachtnemer: Types.ObjectId;
    shift: Types.ObjectId;
    titel: string;
    afbeelding: string;
    uurtarief: number;
    datum: Date;
    begintijd: Date;
    eindtijd: Date;
    pauze?: number;
    feedback?: string;
    opmerking?: string;
}

export async function maakFacturen() {
    try {
        // Get current date
        const currentDate = new Date();
        // Calculate the start date of the current week (Monday)
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1)); // Adjust to Monday

        // Calculate the end date of the current week (Sunday)
        const endDate = new Date(currentDate);
        endDate.setDate(startDate.getDate() + 6); // Add 6 days to get Sunday

        // Find checkouts with status 'false' within the current week
        const checkouts = await Checkout.find({
            status: false,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('bedrijf');

        // Group checkouts by business
        const checkoutsByBusiness: Record<string, typeof Checkout[]> = {};
        checkouts.forEach(checkout => {
            const bedrijfID = checkout.bedrijf._id.toString();
            if (!checkoutsByBusiness[bedrijfID]) {
                checkoutsByBusiness[bedrijfID] = [];
            }
            checkoutsByBusiness[bedrijfID].push(checkout);
        });

        // Iterate over businesses and create bundled invoices
        for (const bedrijfID in checkoutsByBusiness) {
            const checkoutsForBusiness = checkoutsByBusiness[bedrijfID];
            // Create bundled invoice for this business
            const factuurData = {
                shift: checkoutsForBusiness.map(checkout => checkout.shift), // Assuming this is how you want to store shift IDs
                opdrachtgever: checkoutsForBusiness.map(checkout => checkout.opdrachtgever),
                opdrachtnemer: bedrijfID, // Assuming bedrijfID is the ID of the business
                datum: new Date(), // Current date
                tijd: '...', // Replace '...' with actual time data
                werktijden: '...', // Replace '...' with actual work hours data
                werkdatum: '...', // Replace '...' with actual work date data
                pauze: 0 // Replace 0 with actual pauze data or calculate it
            };
            const factuur = new Factuur(factuurData);
            // Save the invoice to the database
            await factuur.save();

            // Update status of checkouts to 'true'
            await Checkout.updateMany(
                { _id: { $in: checkoutsForBusiness.map(checkout => checkout._id) } },
                { $set: { status: true } }
            );
        }
    } catch (error:any) {
        console.error('Error creating bundled invoices:', error);
        throw new Error(`Failed to create bundled invoices: ${error.message}`);
    }
}


export async function haalFacturen() {
    try {
        // Find all facturen
        const facturen = await Factuur.find().populate('checkout'); // Assuming the factura schema has a reference to the checkout

        return facturen;
    } catch (error:any) {
        console.error('Error retrieving facturen:', error);
        throw new Error(`Failed to retrieve facturen: ${error.message}`);
    }
}

export async function haalFactuur(checkoutId: string) {
    try {
        // Find the factura for the given checkout ID
        const factura = await Factuur.findOne({ checkout: checkoutId }).populate('checkout'); // Assuming the factura schema has a reference to the checkout

        if (!factura) {
            throw new Error(`Factura not found for checkout ID: ${checkoutId}`);
        }

        return factura;
    } catch (error:any) {
        console.error('Error retrieving factura:', error);
        throw new Error(`Failed to retrieve factura: ${error.message}`);
    }
}

interface VerstuurFactuurParams {
    shiftId: string;
}

export async function verstuurFactuur({ shiftId }: VerstuurFactuurParams) {
    try {
        // Generate the invoice PDF
        const filePath = await maakFactuur({ shiftId });

        // Fetch checkout information
        const checkout = await Checkout.findOne({ shift: shiftId })
            .populate('opdrachtgever')
            .populate('opdrachtnemer')
            .populate('shift');

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtnemer = checkout.opdrachtnemer;
        const shift = checkout.shift;

        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.example.com', // Replace with your SMTP server
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'your_email@example.com', // Replace with your email
                pass: 'your_email_password' // Replace with your email password
            }
        });

        // Adjust the mailOptions object to ensure proper typing
const mailOptions: Options = {
    from: '"Your Company" <your_email@example.com>', // Replace with your email
    to: opdrachtnemer.emailadres, // Freelancer's email
    subject: `Invoice for Shift: ${shift.titel} on ${shift.datum}`,
    text: 'Please find attached the invoice for your recent shift.',
    attachments: [
        {
            filename: `invoice-${shiftId}.pdf`,
            path: filePath as unknown as string, // Ensure filePath is a string
            contentType: 'application/pdf'
        }
    ]
};

        // Send email
        await transporter.sendMail(mailOptions);

        console.log('Invoice sent successfully.');
    } catch (error: any) {
        throw new Error(`Failed to send invoice: ${error.message}`);
    }
}

export async function verstuurFacturenAutomatisch() {
    // Get today's date
    const today = new Date();
    // Check if today is Friday
    if (today.getDay() === 5) { // Friday is day number 5 (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
        try {
            // Call the function to send invoices
            // Add any necessary logic here to determine which invoices to send
            await verstuurFactuur({}); // Call your function to send individual invoices
            console.log('Invoices sent successfully.');
        } catch (error) {
            console.error('Failed to send invoices:', error);
            // Handle error
        }
    }
}
cron.schedule('0 12 * * 5', async () => {
    await verstuurFacturenAutomatisch();
}, {
    timezone: 'Your/Timezone' // Set your timezone here
});
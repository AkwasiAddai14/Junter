"use server"

import  { Document, Types } from 'mongoose';
import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
import fs from 'fs';
import path from 'path';
import Factuur from '../models/factuur.model';
import cron from 'node-cron';
import { connectToDB } from '../mongoose';
import Shift from '../models/shift.model';



interface FactuurParams {
    shiftId: string;
}

export async function maakFactuur({ shiftId }: FactuurParams) {
    try {
        // Fetch checkout information
        const checkout = await Shift.findOne({ shift: shiftId })
            .populate('opdrachtgever')
            .populate('opdrachtnemer')
            

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtgever = checkout.opdrachtgever;
        const opdrachtnemer = checkout.opdrachtnemer;
        
        if (opdrachtnemer && opdrachtgever) {
        // Calculate total amount to be paid
        const workedHours = (new Date(checkout.eindtijd).getTime() - new Date(checkout.begintijd).getTime()) / (1000 * 60 * 60) - (/* checkout.pauze */  30 || 0) / 60;
        const totalAmount = workedHours * checkout.uurtarief * 1.21;

        // Create a PDF document
        const doc = new PDFDocument();

        // Define file path
        const filePath = path.join(__dirname, `../../invoices/${shiftId}.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        // Add content to the PDF
        doc.fontSize(20).text('Factuur', { align: 'center' });

        doc.moveDown();
        doc.fontSize(12).text(`Opdrachtgever:`);
        doc.text(`Naam: ${opdrachtgever.displaynaam}`);
        doc.text(`Adres: ${opdrachtgever.straatnaam} ${opdrachtgever.huisnummer}, ${opdrachtgever.stad}`);
        doc.text(`KVK Nummer: ${opdrachtgever.kvknr}`);

        doc.moveDown();
        doc.text(`Opdrachtnemer:`);
        doc.text(`Naam: ${opdrachtnemer.voornaam} ${opdrachtnemer.achternaam}`);
        doc.text(`Adres: ${opdrachtnemer.straat} ${opdrachtnemer.huisnummer}, ${opdrachtnemer.stad}`);
        doc.text(`IBAN: ${opdrachtnemer.iban}`);
        doc.text(`BTW Nummer: ${opdrachtnemer.btwid}`);

        doc.moveDown();
        doc.text(`Shift Details:`);
        doc.text(`Titel: ${checkout.titel}`);
        doc.text(`Begintijd: ${checkout.begintijd}`);
        doc.text(`Eindtijd: ${checkout.eindtijd}`);
        doc.text(`Pauze: ${checkout.pauze || 0} minuten`);
        doc.text(`Uurtarief: ${checkout.uurtarief}`)
        doc.text("BTW-tarief: 21%")

        doc.moveDown();
        doc.fontSize(14).text(`Te ontvangen bedrag: €${totalAmount.toFixed(2)}`, { align: 'right' });

        // Finalize the PDF and end the stream
        doc.end();

        console.log('Invoice created successfully.');
    }  else {
        throw new Error('Opdrachtgever or opdrachtnemer is missing, cannot create invoice.');
    } 
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
        await connectToDB();

        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const checkouts = await Shift.find({
            status: false,
            datum: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('opdrachtgever opdrachtnemer');

        const checkoutsByBusiness: Record<string, CheckoutDoc[]> = {};
        checkouts.forEach(checkout => {
            const bedrijfID = checkout.opdrachtgever.toString();
            if (!checkoutsByBusiness[bedrijfID]) {
                checkoutsByBusiness[bedrijfID] = [];
            }
            /* checkoutsByBusiness[bedrijfID].push(checkout) */;
        });

        for (const bedrijfID in checkoutsByBusiness) {
            const checkoutsForBusiness = checkoutsByBusiness[bedrijfID];

            const factuurData = {
                shift: checkoutsForBusiness.map(checkout => checkout.shift),
                opdrachtgever: checkoutsForBusiness.map(checkout => checkout.opdrachtgever),
                opdrachtnemer: new Types.ObjectId(bedrijfID),
                datum: new Date(),
                tijd: '...', // Replace with actual time data
                werktijden: '...', // Replace with actual work hours data
                werkdatum: '...', // Replace with actual work date data
                pauze: checkoutsForBusiness.reduce((acc, checkout) => acc + (checkout.pauze || 0), 0)
            };
            const factuur = new Factuur(factuurData);
            await factuur.save();

            await Shift.updateMany(
                { _id: { $in: checkoutsForBusiness.map(checkout => checkout._id) } },
                { $set: { status: true } }
            );
        }
    } catch (error: any) {
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


interface VerstuurFactuurParams {
    shiftId: string;
}

export async function verstuurFactuur({ shiftId }: VerstuurFactuurParams) {

// Get today's date
const today = new Date();
// Check if today is Friday
if (today.getDay() === 5) { // Friday is day number 5 (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
    try {
        // Generate the invoice PDF
        const filePath = await maakFactuur({ shiftId });

        // Fetch checkout information
        const checkout = await Shift.findOne({ shift: shiftId })
            .populate('opdrachtgever')
            .populate('opdrachtnemer')
            

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtnemer = checkout.opdrachtnemer;
       

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


        if (!opdrachtnemer) {
            throw new Error('Opdrachtnemer is missing, cannot create invoice.');
        }
        // Adjust the mailOptions object to ensure proper typing
    const mailOptions: Options = {
    from: '"Your Company" <your_email@example.com>', // Replace with your email
    to: opdrachtnemer.emailadres, // Freelancer's email
    subject: `Invoice for Shift: ${checkout.titel} on ${checkout.begindatum}`,
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
}


/* cron.schedule('0 12 * * 5', async () => {
   
}, {
    timezone: 'Your/Timezone' // Set your timezone here
}); */

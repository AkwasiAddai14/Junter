import mongoose, { Document, Model } from 'mongoose';

const shiftSchema = new mongoose.Schema({
  opdrachtgever: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bedrijf',
    required: true
  },
  opdrachtnemer: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Freelancer',
    required: false
  },
  flexpools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flexpool', // corrected to match the Flexpool model
    required: false
  }],
  vervangers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Freelancer'
  }],
  shiftArrayId: { type: String },
  titel: { type: String, required: true },
  functie: { type: String, required: true },
  afbeelding: { type: String, required: true },
  uurtarief: { type: Number, required: true },
  plekken: { type: Number, required: true },
  adres: { type: String, required: true },
  begindatum: { type: Date, required: true },
  einddatum: { type: Date, required: true },
  begintijd: { type: String, required: true },
  eindtijd: { type: String, required: true },
  pauze: { type: String, required: false },
  beschrijving: { type: String, required: true },
  vaardigheden: [{ type: String, required: false }],
  kledingsvoorschriften: [{ type: String, required: false }],
  beschikbaar: { type: Boolean, required: true, default: true },
  inFlexpool: { type: Boolean, default: false },
  checkoutbegintijd: { type: String, required: false }, // Using Date type for time
  checkouteindtijd: { type: String, required: false }, // Using Date type for time
  checkoutpauze: { type: String, required: false },
  feedback: { type: String },
  opmerking: { type: String },
  ratingFreelancer: { type: Number },
  ratingBedrijf: { type: Number },
  status: { type: String, required: true }
});

interface FreelancerDetails {
  iban: string;
  btwid: string;
  huisnummer: string;
  straat: string;
  stad: string;
  voornaam: string;
  achternaam: string;
  emailadres: string;
}

export type ShiftType = Document & {
  opdrachtgever: mongoose.Types.ObjectId & { displaynaam: string; stad: string; straatnaam: string; huisnummer: string; kvknr: string; emailadres: string };
  opdrachtnemer?: mongoose.Types.ObjectId | (mongoose.Types.ObjectId & FreelancerDetails);
  flexpools?: (mongoose.Types.ObjectId & { titel: string })[];
  vervangers?: mongoose.Types.ObjectId[];
  _id: string;
  shiftArrayId: string;
  titel: string;
  functie: string;
  afbeelding: string;
  uurtarief: number;
  plekken: number;
  adres: string;
  begindatum: Date;
  einddatum: Date;
  begintijd: string;
  eindtijd: string;
  pauze?: string;
  beschrijving: string;
  vaardigheden?: string[];
  kledingsvoorschriften?: string[];
  beschikbaar: boolean;
  inFlexpool?: boolean;
  checkoutbegintijd: Date;
  checkouteindtijd: Date;
  checkoutpauze: number;
  feedback: string;
  opmerking: string;
  ratingFreelancer: number;
  ratingBedrijf: number;
  status: string;
};

const Shift: Model<ShiftType> = mongoose.models.Shift || mongoose.model<ShiftType>('Shift', shiftSchema);

export default Shift;

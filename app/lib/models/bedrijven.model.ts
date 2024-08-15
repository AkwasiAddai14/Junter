import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBedrijf extends Document {
  clerkId: string;
  naam: string;
  displaynaam?: string;
  bio?: string;
  profielfoto?: string;
  kvknr: string;
  btwnr?: string;
  postcode: string;
  huisnummer: string;
  stad?: string;
  straat?: string;
  telefoonnummer: string;
  emailadres: string;
  iban?: string;
  onboarded?: boolean;
  ratingCount?: number;
  rating?: number;
  facturen: mongoose.Types.ObjectId[];
  filialen: mongoose.Types.ObjectId[];
  flexpools: mongoose.Types.ObjectId[];
  shifts: mongoose.Types.ObjectId[];
}

const bedrijvenSchema: Schema<IBedrijf> = new mongoose.Schema({
  clerkId: { type: String, required: true },
  naam: { type: String, required: true },
  displaynaam: { type: String, required: false },
  bio: { type: String, required: false },
  profielfoto: { type: String, required: false },
  kvknr: { type: String, required: true },
  btwnr: { type: String, required: false },
  postcode: { type: String, required: true },
  huisnummer: { type: String, required: true },
  stad: { type: String, required: false },
  straat: { type: String, required: false },
  telefoonnummer: { type: String, required: true },
  emailadres: { type: String, required: true },
  iban: { type: String, required: false },
  onboarded: { type: Boolean, default: false },
  ratingCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  facturen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Factuur"
  }],
  filialen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bedrijven'
  }],
  flexpools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flexpool'
  }],
  shifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShiftArray'
  }]
});

const Bedrijf: Model<IBedrijf> = mongoose.models.Bedrijven || mongoose.model<IBedrijf>('Bedrijven', bedrijvenSchema);
export default Bedrijf;

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ShiftType } from './shift.model';

export interface IShiftArray extends Document {
    opdrachtgever: mongoose.Schema.Types.ObjectId;
    aanmeldingen: mongoose.Schema.Types.ObjectId[];
    reserves: mongoose.Schema.Types.ObjectId[];
    aangenomen: mongoose.Schema.Types.ObjectId[];
    flexpools: mongoose.Schema.Types.ObjectId[];
    shifts: mongoose.Schema.Types.ObjectId[];
    opdrachtgeverNaam: string,
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
    status: string;
    inFlexpool: boolean;
}

const shiftArraySchema: Schema<IShiftArray> = new mongoose.Schema({
    opdrachtgever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bedrijf',
        required: true
    },
    aanmeldingen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freelancer',
            required: false
        }
    ],
    aangenomen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freelancer',
            required: false
        }
    ],
    reserves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freelancer',
            required: false
        }
    ],
    flexpools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flexpool',
        required: false
    }],
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
    }],
    titel: { type: String, required: true },
    opdrachtgeverNaam: { type:  String, required: true},
    functie: { type: String, required: true },
    afbeelding: { type: String, required: true },
    uurtarief: { type: Number, required: true },
    plekken: { type: Number, required: true },
    adres: { type: String, required: true },
    begindatum: { type: Date, required: false },
    einddatum: { type: Date, required: false },
    begintijd: { type: String, required: true },
    eindtijd: { type: String, required: true },
    pauze: { type: String, required: false },
    beschrijving: { type: String, required: true },
    vaardigheden: [{ type: String, required: false }],
    kledingsvoorschriften: [{ type: String, required: false }],
    beschikbaar: { type: Boolean, required: true, default: true },
    status: { type: String, default: 'beschikbaar'},
    inFlexpool: { type: Boolean, default: false }
});

const ShiftArray: Model<IShiftArray> = mongoose.models.ShiftArray || mongoose.model<IShiftArray>('ShiftArray', shiftArraySchema);
export default ShiftArray;

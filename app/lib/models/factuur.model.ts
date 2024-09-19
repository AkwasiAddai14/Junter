import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFactuur extends Document {
    week: string;
    shifts: mongoose.Schema.Types.ObjectId[];
    opdrachtgever: mongoose.Schema.Types.ObjectId[];
    opdrachtnemers: mongoose.Schema.Types.ObjectId[];
    datum: Date;
    tijd: string;
    werkdatum: string;
    totaalbedrag: string;
    isVoltooid: string;
  }

const factuurSchema = new mongoose.Schema({
   week: {type: String, required: true},
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift"
    }],
    opdrachtgever: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer"
    }],
    opdrachtnemers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bedrijf"
    }],
    datum: {type: Date, default: Date.now},
    tijd: {type: String, required: true},
    werkdatum: {type: String, required: true},
    totaalbedrag: {type: String, required: true},
    isVoltooid: {type: Boolean, default: false}
});

const Factuur = mongoose.models.Factuur || mongoose.model('Factuur', factuurSchema);
export default Factuur;


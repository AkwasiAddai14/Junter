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
        ref: 'Flexpools',
        required: false
    }], vervangers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Freelancer'
    }],
    shiftArrayId: {type: String, required: true},
    titel: {type: String, required: true},
    functie: {type: String, required: true},
    afbeelding: {type: String, required: true},
    uurtarief: {type: Number, required: true},
    plekken: {type: Number, required: true},
    adres: {type: String, required: true},
    begindatum: {type: Date, required: true},
    einddatum: {type: Date, required: true},
    begintijd: {type: String, required: true},
    eindtijd: {type: String, required: true},
    pauze: {type: String, required: false},
    beschrijving: {type: String, required: true},
    vaardigheden: [{type: String, required: false}],
    kledingsvoorschriften: [{type: String, required: false}],
    beschikbaar: {type: Boolean, required: true, default: true},
    inFlexpool: {type: Boolean, default: false},
    status: {type: String, required: true}
})

export type ShiftType = Document & {
    opdrachtgever: mongoose.Types.ObjectId & { displaynaam: string; stad: string };
    opdrachtnemer?: mongoose.Types.ObjectId;
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
    status: string;
  };


  const Shift = mongoose.models.Shift || mongoose.model('Shifts', shiftSchema);
  export default Shift;
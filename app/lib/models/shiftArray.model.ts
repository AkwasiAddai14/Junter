import mongoose from 'mongoose';


const shiftArraySchema = new mongoose.Schema({
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
    flexpools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flexpool',
        required: false
    }],
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
    }],
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
    pauze: {type: Number, required: false},
    beschrijving: {type: String, required: true},
    vaardigheden: [{type: String, required: false}],
    kledingsvoorschriften: [{type: String, required: false}],
    beschikbaar: {type: Boolean, required: true, default: true},
    inFlexpool: {type: Boolean, default: false},
})


const ShiftArray = mongoose.models.ShiftArray || mongoose.model('ShiftArray', shiftArraySchema);
export default ShiftArray
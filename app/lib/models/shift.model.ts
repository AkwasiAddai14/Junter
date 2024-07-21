

import mongoose from 'mongoose';


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
    flexpools: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flexpools',
        required: false
    }, vervangers: [{
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
    datum: {type: Date, required: true},
    begintijd: {type: String, required: true},
    eindtijd: {type: String, required: true},
    pauze: {type: Number, required: false},
    beschrijving: {type: String, required: true},
    vaardigheden: {type: String, required: false},
    kledingsvoorschriften: {type: String, required: false},
    beschikbaar: {type: Boolean, required: true, default: true},
    inFlexpool: {type: Boolean, default: false},
    status: {type: String, required: true}
})


const Shift = mongoose.models.Shift || mongoose.model('Shifts', shiftSchema);
export default Shift
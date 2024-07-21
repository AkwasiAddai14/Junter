

import mongoose from 'mongoose';

const bedrijvenSchema = new mongoose.Schema({
    bedrijvenID: { type: String, required: true },
    naam: {type: String, required: true},
    displaynaam: {type: String, required: true},
    bio: {type: String, required: true},
    profielfoto: {type: String, required: true},
    kvknr: {type: String, required: true},
    btwnr: {type: String, required: true},
    postcode: {type: String, required: true},
    huisnummer: {type: String, required: true},
    stad: {type: String, required: false},
    straat: {type: String, required: false},
    telefoonnummer: {type: String, required: true},
    emailadres: {type: String, required: true},
    iban: {type: String, required: true},
    onboarded: {type: Boolean, default: false},
    ratingCount: {type: Number, default: 0},
    rating: { rate: Number},
    checkouts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checkout",
    }],
    facturen: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Factuur"
    }],
    filialen: [
        {
            vestigingsnummer: {type: String, required: false}
        },
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bedrijven'
        }
],
    flexpools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flexpool'
    }],
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShiftArray'
    }]
});

const Bedrijf = mongoose.models.Bedrijven || mongoose.model('Bedrijven', bedrijvenSchema);
export default Bedrijf;

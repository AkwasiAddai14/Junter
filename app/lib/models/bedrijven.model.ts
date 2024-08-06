import mongoose from 'mongoose';

const bedrijvenSchema = new mongoose.Schema({
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
    rating: { rate: Number },
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
            vestigingsnummer: { type: String, required: false }
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

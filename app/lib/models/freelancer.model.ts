import mongoose from 'mongoose';

const freelancerSchema = new mongoose.Schema({
    clerkId: {type: String, required: true},
    voornaam: { type: String, required: true},
    tussenvoegsel: { type: String, required:false},
    achternaam: { type: String, required: true},
    geboortedatum: {type: String, required: true},
    telefoonnummer: {type: String, required: true},
    emailadres: {type: String, required: true},
    bsn: { type: String, required: true},
    korregeling: { type: Boolean, default: false},
    btwid:{ type: String, required: false},
    iban: { type: String, required: true},
    postcode: { type: String, required: true},
    huisnummer: { type: String, required: true},
    straat: {type: String, required: false},
    stad: {type: String, required: false},
    onboarded: { type: Boolean, default: false},
    profielfoto: { type: String, required: true},
    ratingCount: { type: Number, default: 0},
    rating: { type: Number, default: 5},
    opkomst: {type: Number, default: 100},
    punctualiteit: {type: Number, default: 100},
    werkervaring: [
        {
            bedrijf: {type: String, required: true},
            functie: {type: String, required: true},
            duur: {type: String, required: true}
        }
    ],
    vaardigheden: [
        {
            vaardigheid: {type: String, required: false}
        }
    ],
    opleidingen: [
        {
            naam: {type: String, required: true},
            school: {type: String, required: true},
            niveau: {type: String, required: false}
        }
    ],
    shifts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            status: { type: String, required: true }
        }
    ],
    flexpools:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flexpools"
        }
    ],
    facturen: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Factuur"
    }],
});

const Freelancer = mongoose.models.Freelancer || mongoose.model('Freelancer', freelancerSchema);
export default Freelancer
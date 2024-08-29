import mongoose from 'mongoose';

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


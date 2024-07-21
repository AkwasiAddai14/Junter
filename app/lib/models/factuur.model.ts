import mongoose from 'mongoose';

const factuurSchema = new mongoose.Schema({
    factuurId: { type: String, required: true},
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift"
    },
    opdrachtgever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer"
    },
    opdrachtnemer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bedrijven"
    },
    datum: {type: Date, default: Date.now},
    tijd: {type: String, required: true},
    werktijden: {String, required: true},
    werkdatum: {type: String, required: true},
    pauze: {type: Number, required: false},
});

const Factuur = mongoose.models.Bedrijven || mongoose.model('Factuur', factuurSchema);
export default Factuur;


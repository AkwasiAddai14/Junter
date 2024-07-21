import mongoose from 'mongoose';

const checkoutSchema = new mongoose.Schema({
    opdrachtgever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bedrijf',
        required: true
    },
    opdrachtnemer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
        required: true
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    titel: { type: String, required: true },
    afbeelding: { type: String, required: true }, // Assuming afbeelding is a URL to an image
    uurtarief: { type: Number, required: true },
    datum: { type: Date, required: true },
    begintijd: { type: Date, required: true }, // Using Date type for time
    eindtijd: { type: Date, required: true }, // Using Date type for time
    pauze: { type: Number, required: false },
    feedback: { type: String },
    opmerking: { type: String },
    status: { type: Boolean, default: false }
});

const Checkout = mongoose.models.Checkout || mongoose.model('Checkout', checkoutSchema);
export default Checkout;
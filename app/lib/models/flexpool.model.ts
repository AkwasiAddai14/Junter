import mongoose from 'mongoose';

const flexpoolSchema = new mongoose.Schema ({
    titel: {type: String, required: true},
    bedrijf: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bedrijven'
        },
    freelancers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Freelancer'
    }],
    shifts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shift'
        }
    ]
})


const Flexpool = mongoose.models.Flexpool || mongoose.model('Flexpool', flexpoolSchema);
export default Flexpool;
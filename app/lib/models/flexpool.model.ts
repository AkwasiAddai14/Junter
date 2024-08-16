import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFlexpool extends Document {
  titel: string;
  bedrijf: mongoose.Schema.Types.ObjectId;
  freelancers: mongoose.Schema.Types.ObjectId[];
  shifts: mongoose.Schema.Types.ObjectId[];
}

const flexpoolSchema: Schema<IFlexpool> = new mongoose.Schema({
  titel: { type: String, required: true },
  bedrijf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bedrijf',
    required: true,
  },
  freelancers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    default: []
  }],
  shifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: []
  }]
});

const Flexpool: Model<IFlexpool> = mongoose.models.Flexpool || mongoose.model<IFlexpool>('Flexpool', flexpoolSchema);
export default Flexpool;


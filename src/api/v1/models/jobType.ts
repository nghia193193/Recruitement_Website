import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

export const JobType = mongoose.model('JobType', jobTypeSchema);
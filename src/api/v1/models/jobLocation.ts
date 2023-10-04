import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobLocSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

export const JobLocation = mongoose.model('JobLocation', jobLocSchema);
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobSkillSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    skillId: {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    }
});

export const JobSkill = mongoose.model('JobSkill', jobSkillSchema);
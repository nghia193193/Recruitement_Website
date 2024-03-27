import createHttpError from "http-errors";
import mongoose, { Schema } from "mongoose";
import { User } from "./user";
import { Job } from "./job";


const favoriteJobSchema = new Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    favoriteJobs: {
        type: Array,
        default: []
    }
});

favoriteJobSchema.statics.getFavoriteJob = async function (candidateId) {
    const candidate = await User.findById(candidateId).populate('roleId');
    if (!candidate) {
        throw createHttpError.NotFound('User not existed!');
    }
    if (candidate?.get('roleId.roleName') !== 'CANDIDATE') {
        throw createHttpError.Unauthorized();
    }
    const favoriteJob = await this.findOne({ userId: candidateId });
    if (!favoriteJob) {
        const error: Error & { success?: boolean, result?: any } = new Error("Your favorite job list is empty");
        error.success = true;
        error.result = {
            content: []
        }
        throw new Error()
    }
    
    const mappedFavoriteJobs = await Promise.all(
        favoriteJob.favoriteJobs.map(async (jobId: any) => {
            return await (Job as any).getJobDetail(jobId);
        })
    )

    return mappedFavoriteJobs;
}

export const FavoriteJob = mongoose.model('FavoriteJob', favoriteJobSchema);
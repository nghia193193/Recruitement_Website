import { Router } from "express";
import authRoutes from './auth.route';
import eventRoutes from './event.route';
import jobRoutes from './job.route';
import userRoutes from './user.route';
import candidateRoutes from './candidate.route';
import recruiterRoutes from './recruiter.route';
import skillRoutes from './skill.route';
import interviewerRoutes from './interviewer.route';
import adminRoutes from './admin.route';

const routes = Router();

routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/events', eventRoutes);
routes.use('/api/v1/jobs', jobRoutes);
routes.use('/api/v1/user', userRoutes);
routes.use('/api/v1/candidate', candidateRoutes);
routes.use('/api/v1/recruiter', recruiterRoutes);
routes.use('/api/v1/skills', skillRoutes);
routes.use('/api/v1/interviewers', interviewerRoutes);
routes.use('/api/v1/admin', adminRoutes);

export default routes;

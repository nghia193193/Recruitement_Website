import { Router } from "express";
import authRoutes from './auth';
import eventRoutes from './event';
import jobRoutes from './job';
import userRoutes from './user'

const routes = Router();

routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/events', eventRoutes);
routes.use('/api/v1/jobs', jobRoutes);
routes.use('/api/v1/user', userRoutes);

export default routes;

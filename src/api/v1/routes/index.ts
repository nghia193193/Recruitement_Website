import { Router } from "express";
import authRoutes from './auth.route';
import eventRoutes from './event.route';
import jobRoutes from './job.route';
import userRoutes from './user.route'

const routes = Router();

routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/events', eventRoutes);
routes.use('/api/v1/jobs', jobRoutes);
routes.use('/api/v1/user', userRoutes);

export default routes;

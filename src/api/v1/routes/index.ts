import { Router } from "express";
import authRoutes from './auth';
import eventRoutes from './event';
import jobRoutes from './job';

const routes = Router();

routes.use('/api/v1', authRoutes);
routes.use('/api/v1', eventRoutes);
routes.use('/api/v1', jobRoutes);

export default routes;

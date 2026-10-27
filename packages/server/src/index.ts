import { app } from './app';
import { logger } from './utils/logger';
app.listen(3000, () => logger.info(`Server started on ${process.env.API_URL}`));
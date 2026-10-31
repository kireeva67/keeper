import { app } from './app';
import { logger } from './utils/logger';
app.listen(Number(process.env.PORT || 3000), () => logger.info(`Server started on ${process.env.API_URL}`));
import { app } from './app';
app.listen(3000, () => console.log(`Server started on ${process.env.API_URL}`));
import 'dotenv/config';
import { app } from './app.js';
import { initCronJobs } from './cron/index.js';

const PORT = Number(process.env['PORT']) || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initCronJobs();
});
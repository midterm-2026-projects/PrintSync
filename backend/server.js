import dotenv from 'dotenv';

// Load backend/.env so server start uses the same configuration as tests.
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  }
};

startServer();



const app = require('./app');
const connectDB = require('./config/db');
const { ensureAdminUser } = require('./controllers/authController');

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    const requiredEnv = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missingEnv = requiredEnv.filter((name) => !process.env[name]);
    if (missingEnv.length) throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    let connected = false;
    for (let attempt = 1; attempt <= 3 && !connected; attempt += 1) {
      try {
        await connectDB();
        connected = true;
      } catch (error) {
        console.error(`MongoDB connection attempt ${attempt}/3 failed: ${error.message}`);
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    if (!connected) throw new Error('MongoDB is unavailable after 3 connection attempts. Check Atlas Network Access and credentials.');
    await ensureAdminUser();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

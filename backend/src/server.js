const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('📦 Connected to PostgreSQL Database via Prisma.');

    const server = app.listen(env.port, () => {
      console.log(`🚀 MessyList Backend listening on port ${env.port} [${env.nodeEnv}]`);
      console.log(`🤖 AI Status: ${env.gemma.isConfigured ? 'Connected to Gemma (' + env.gemma.model + ')' : 'Running in Intelligent Demo Mode'}`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Prisma disconnected. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

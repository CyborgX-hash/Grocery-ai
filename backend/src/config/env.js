require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  gemma: {
    apiKey: process.env.GEMMA_API_KEY || '',
    apiUrl: process.env.GEMMA_API_URL || 'https://api-inference.huggingface.co/models/google/gemma-2-9b-it',
    model: process.env.GEMMA_MODEL || 'google/gemma-2-9b-it',
    isConfigured: Boolean(process.env.GEMMA_API_KEY && process.env.GEMMA_API_KEY.trim().length > 0),
  },
};

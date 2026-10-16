import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'clinicqueue-super-secret-key-tier2-3',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  defaultClinicId: 'clinic-apollo-hubli-001',
  supportedLanguages: ['en', 'hi', 'kn'] as const,
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'mock-phone-id',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'mock-token',
  }
}

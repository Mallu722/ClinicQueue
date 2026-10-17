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
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+14155238886',
  }
}

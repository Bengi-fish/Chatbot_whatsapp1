import dotenv from 'dotenv'

dotenv.config()

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value || defaultValue!
}

export const config = {
  port: {
    bot: parseInt(getEnvVar('PORT', '3008')),
    api: parseInt(getEnvVar('API_PORT', '3009'))
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'dev_secret_change_in_production'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production')
  },
  whatsapp: {
    jwtToken: getEnvVar('JWT_TOKEN'),
    numberId: getEnvVar('NUMBER_ID'),
    verifyToken: getEnvVar('VERIFY_TOKEN'),
    version: getEnvVar('PROVIDER_VERSION', 'v21.0')
  },
  sendgrid: {
    apiKey: getEnvVar('SENDGRID_API_KEY', ''),
    fromEmail: getEnvVar('SENDGRID_FROM_EMAIL', '')
  },
  frontend: {
    url: getEnvVar('FRONTEND_URL', 'http://localhost:3009')
  },
  mongodb: {
    uri: getEnvVar('MONGO_URI', 'mongodb://localhost:27017/avellano-chatbot')
  }
}

export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api/v0',
  AI_BASE_URL: import.meta.env.VITE_AI_URL || '/ai-api',

  APP_NAME: 'HealthAI Coach',
  VERSION: '1.0.0',
  
  AUTH: {
    TOKEN_KEY: 'healthai_token',
    TOKEN_TYPE: 'Bearer'
  }
}
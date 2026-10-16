import { app } from './app'
import { config } from './config'

const server = app.listen(config.port, () => {
  console.log(`====================================================`)
  console.log(`🚀 ClinicQueue Backend API Running on port ${config.port}`)
  console.log(`🏥 Environment: ${config.nodeEnv}`)
  console.log(`📍 Health Check: http://localhost:${config.port}/health`)
  console.log(`📖 API Base: http://localhost:${config.port}/api/v1`)
  console.log(`====================================================`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

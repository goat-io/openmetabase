import dotenv from 'dotenv'
dotenv.config() // Load environment variables from .env file
import app from './app'

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

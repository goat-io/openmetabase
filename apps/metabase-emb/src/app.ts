import express, { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import cors from 'cors'

const app = express()
const METABASE_SECRET_KEY = process.env.METABASE_EMBEDDING_TOKEN
if (!METABASE_SECRET_KEY) {
  throw new Error('No METABASE_SECRET_KEY provided. Please update the env')
}

// Middleware to parse JSON request bodies
app.use(express.json())

app.use(
  cors({
    origin: '*', // 'http://localhost:3001',
  }),
)

// Basic route
app.post('/get-dashboard', (req: Request, res: Response) => {
  const METABASE_SITE_URL = 'http://127.0.0.1:3000'

  // TODO: validate request
  const dashboard = Number(req.body.dashboard)
  const params = req.body.params
  const refresh = 0

  const payload = {
    resource: { dashboard },
    params,
    exp: Math.round(Date.now() / 1000) + 5 * 60, // 5 minute expiration
  }

  const token = sign(payload, METABASE_SECRET_KEY)

  let iframeUrl =
    METABASE_SITE_URL +
    '/embed/dashboard/' +
    token +
    '#bordered=false&titled=true'

  if (refresh) {
    iframeUrl = `${iframeUrl}&refresh=${refresh}`
  }

  res.json({
    iframeUrl,
    apiKey: 'mb_jdVvfPbU4VqfkblxeRoae22GMI+9nT2hi6F6it3hRGw=',
  })
})

export default app

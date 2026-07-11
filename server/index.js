import 'dotenv/config'
import express from 'express'
import ViteExpress from 'vite-express'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'

const app = express()

// Must be mounted before express.json() - Better Auth reads the raw request body.
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)

const port = process.env.PORT || 3000
ViteExpress.listen(app, port, () => console.log(`Server listening on http://localhost:${port}`))

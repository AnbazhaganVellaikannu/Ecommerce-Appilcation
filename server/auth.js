import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { pool } from './db.js';

// Render sets RENDER_EXTERNAL_URL automatically to the deployed service's
// https://<name>.onrender.com URL — use it so production doesn't need
// BETTER_AUTH_URL set by hand after every fresh deploy.
const baseURL = process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  // In dev, the browser's page origin is Vite's port (5173), not the Express
  // port baseURL points to — both must be trusted for the origin check to pass.
  trustedOrigins: [baseURL, 'http://localhost:5173'].filter(Boolean),
  emailAndPassword: {
    enabled: true,
  },
});

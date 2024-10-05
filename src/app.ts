import express from 'express';
import morgan from 'morgan';
import cors from 'cors'

import { handleStripeWebhook } from './controllers/payment/handleWebhook.controller';
import { authenticationMiddleware } from './middlewares/authentication.middleware';
import { routeNotFoundMiddleware } from './middlewares/routeNotFound.middleware';
import { ErrorHandlerMiddleware } from './middlewares/errorHandling.middleware';
import { checkEnvVariables, env } from './config/env';
import { apiRoutes } from './routes';
import './config/redisClient.config'

checkEnvVariables();

// Initialize Express app
export const app = express();

// Handle Stripe webhook
app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Add CORS policy
app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request details in development environment
if (env.environment === 'development') {
    app.use(
        morgan((tokens, req, res) => {
            return [
                tokens.method(req, res),
                tokens.url(req, res),
                tokens.status(req, res),
                tokens.res(req, res, 'content-length'), '-',
                tokens['response-time'](req, res), 'ms'
            ].join(' ')
        },
            {
                stream: {
                    write: (message) => {
                        console.log(message.trim());
                    }
                }
            }
        )
    )
}

// Authentication middleware
app.use(authenticationMiddleware);

// API routes
app.use('/api/v1', apiRoutes);

// 404 route
app.use('*', routeNotFoundMiddleware);

// Error handler
app.use(ErrorHandlerMiddleware)




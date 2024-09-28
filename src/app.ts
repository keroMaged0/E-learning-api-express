import express from 'express';
import morgan from 'morgan';
import cors from 'cors'

import { authenticationMiddleware } from './middlewares/authentication.middleware';
import { routeNotFoundMiddleware } from './middlewares/routeNotFound.middleware';
import { ErrorHandlerMiddleware } from './middlewares/errorHandling.middleware';
import { checkEnvVariables, env } from './config/env';
import { apiRoutes } from './routes';
import './config/redisClient.config'
import Stripe from 'stripe';
import { log } from 'winston';

checkEnvVariables();

// Initialize Express app
export const app = express();

app.post('/webhook',
    express.raw({ type: 'application/json' }),
    (request, response) => {
        const sig = request.headers['stripe-signature'];
        if (!sig) {
            return response.status(400).send('Missing Stripe signature');
        }

        let event;

        try {
            event = Stripe.webhooks.constructEvent(
                request.body,
                sig,
                env.stripe.webhookSecret as string
            );
        } catch (err: any) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const data = event.data.object;
                console.log(data);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        response.send();
    }
);


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

app.use(authenticationMiddleware);


app.get('/success', (req, res) => {
    const { session_id } = req.query;
    console.log('====================================');
    console.log("session_id:", session_id);
    console.log('====================================');

    if (!session_id) {
        return res.status(400).send('Session ID is missing');
    }

    res.status(200).json({ message: 'Payment successful' });
})


// API routes
app.use('/api/v1', apiRoutes);

// 404 route
app.use('*', routeNotFoundMiddleware);

// Error handler
app.use(ErrorHandlerMiddleware)




import { connectMongoDB } from './config/mongoConnect';
import { mailTransporter } from './utils/mail';
import { env } from './config/env';
import './types/customDefinition';
import { server } from './socket';

const start = async () => {
    // connect to DB
    await connectMongoDB(env.mongoDb.url);

    // verify mail transporter
    mailTransporter.verifyTransporter();

    // start server
    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.environment} mode.`);
    });
}

start()
import { LogtailTransport } from "@logtail/winston";
import { Logtail } from "@logtail/node";
import winston from 'winston';
import { env } from "./env";


const { combine, timestamp, simple, errors, printf } = winston.format;

// Create a Logtail client
const logtail = new Logtail(`${env.winston.sourceToken}`);

/*************** Logging system ***************/
export const logger = winston.createLogger({
    format: combine(
        timestamp(),
        errors({ stack: true }),
        simple(),
        printf((info: any) => {
            if (info.stack) {
                return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}\n${info.stack}`;
            }
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'project.log' }),
        new LogtailTransport(logtail),
    ]
})
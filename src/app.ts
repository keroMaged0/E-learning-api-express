import express from "express";
import morgan from "morgan";
import cors from "cors";

import { handleStripeWebhook } from "./controllers/payment/handleWebhook.controller";
import { authenticationMiddleware } from "./middlewares/authentication.middleware";
import { routeNotFoundMiddleware } from "./middlewares/routeNotFound.middleware";
import { ErrorHandlerMiddleware } from "./middlewares/errorHandling.middleware";
import { checkEnvVariables, env } from "./config/env";
import { logger } from "./utils/logger";
import { apiRoutes } from "./routes";
import "./config/redisClient.config";

checkEnvVariables();

export const app = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.environment === "development") {
  app.use(
    app.use(
      morgan("combined", {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    )
  );
}

app.use(authenticationMiddleware);

app.use("/api/v1", apiRoutes);

app.use("*", routeNotFoundMiddleware);

app.use(ErrorHandlerMiddleware);

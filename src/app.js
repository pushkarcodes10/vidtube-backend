import express from "express";
import cors from 'cors';
import logger from "./logger.js";
import morgan from "morgan";

const app = express();
const morganFormat = ":method :url :status :response-time ms";

app.use(                // custom loggers
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

//common middleware
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js"

// routes
app.use("/api/v1/healthcheck", healthcheckRouter)
export { app } 
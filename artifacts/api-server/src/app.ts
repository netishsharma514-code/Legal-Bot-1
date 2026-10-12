import express, { type Express } from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ??
    "https://netishsharma514-code.github.io,http://localhost:4173,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const createApiLimiter = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait before trying again." },
  });

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Request origin is not allowed."));
    },
  }),
);
app.use("/api/chat", createApiLimiter(60_000, 20));
app.use("/api/analyze-document", createApiLimiter(15 * 60_000, 12));
app.use("/api/extract-document-text", createApiLimiter(15 * 60_000, 20));
app.use("/api/consultation-inquiries", createApiLimiter(15 * 60_000, 8));
app.use("/api/lawyer-applications", createApiLimiter(15 * 60_000, 5));
app.use("/api/analyze-document", express.json({ limit: "42mb" }));
app.use(express.json({ limit: "14mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const requestBodyErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if ((error as { type?: string })?.type === "entity.too.large") {
    res.status(413).json({ error: "Request body exceeds the supported upload size." });
    return;
  }
  next(error);
};

app.use(requestBodyErrorHandler);

export default app;

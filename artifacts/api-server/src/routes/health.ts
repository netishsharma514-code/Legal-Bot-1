import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  if (
    !process.env.GEMINI_API_KEY ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    res.status(503).json({ error: "Service configuration is incomplete." });
    return;
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

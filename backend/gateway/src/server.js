import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const SERVICES = {
  auth: "http://localhost:4001",
  incidents: "http://localhost:4002",
  operations: "http://localhost:4003",
  integrations: "http://localhost:4004"
};

const ROUTES = [
  { prefix: "/api/auth",       target: SERVICES.auth },
  { prefix: "/api/reports",     target: SERVICES.incidents },
  { prefix: "/api/brigades",    target: SERVICES.operations },
  { prefix: "/api/alerts",      target: SERVICES.operations },
  { prefix: "/api/risk-zones",  target: SERVICES.operations },
  { prefix: "/api/evacuation-points", target: SERVICES.operations },
  { prefix: "/api/summary",     target: SERVICES.operations },
  { prefix: "/api/users",       target: SERVICES.operations },
  { prefix: "/api/mock",        target: SERVICES.integrations }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SIGIF Gateway", mode: "local-mock" });
});

app.all("*", async (req, res) => {
  const route = ROUTES.find((r) => req.path.startsWith(r.prefix));
  if (!route) return res.status(404).json({ message: "Ruta no encontrada en gateway" });

  const targetUrl = `${route.target}${req.path}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;

  try {
    const bodyData = req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined;
    console.log(`[gateway] → ${req.method} ${targetUrl} body=${bodyData ? bodyData.slice(0,100) : "none"}`);

    const forwardHeaders = { "content-type": "application/json" };
    if (req.headers.authorization) {
      forwardHeaders.authorization = req.headers.authorization;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyData
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[gateway] Error forwarding to ${targetUrl}:`, err.message);
    res.status(502).json({ message: `Error conectando con servicio: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`[gateway] running at http://localhost:${port}`);
});

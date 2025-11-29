const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());

const AUTH_HOST = process.env.AUTH_HOST;       // e.g. http://weatherapp-auth:3000
const WEATHER_HOST = process.env.WEATHER_HOST; // e.g. http://weatherapp-weather:4000

app.use(express.static(path.join(__dirname, "public")));

// health endpoints for probes
app.get("/health", (req, res) => res.json({ status: "alive" }));
app.get("/ready", (req, res) => res.json({ status: "ready" }));

// ===== proxy signup =====
app.post("/api/signup", async (req, res) => {
  if (!AUTH_HOST) return res.status(500).json({ error: "AUTH_HOST not configured" });

  try {
    const r = await axios.post(`${AUTH_HOST}/signup`, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    return res.status(r.status).json(r.data);
  } catch (err) {
    const code = err.response?.status || 500;
    const data = err.response?.data || { error: "Signup failed" };
    return res.status(code).json(data);
  }
});

// ===== proxy login =====
app.post("/api/login", async (req, res) => {
  if (!AUTH_HOST) return res.status(500).json({ error: "AUTH_HOST not configured" });

  try {
    const r = await axios.post(`${AUTH_HOST}/login`, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    return res.status(r.status).json(r.data);
  } catch (err) {
    const code = err.response?.status || 500;
    const data = err.response?.data || { error: "Login failed" };
    return res.status(code).json(data);
  }
});

// ===== proxy weather search =====
// forwards Authorization header if present
app.get("/api/weather", async (req, res) => {
  if (!WEATHER_HOST) return res.status(500).json({ error: "WEATHER_HOST not configured" });

  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "city is required" });

  try {
    const headers = {};
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

    const r = await axios.get(`${WEATHER_HOST}/weather`, {
      params: { city },
      headers,
      timeout: 10000
    });

    return res.status(r.status).json(r.data);
  } catch (err) {
    const code = err.response?.status || 500;
    const data = err.response?.data || { error: "Failed to fetch weather" };
    return res.status(code).json(data);
  }
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 80;
app.listen(PORT, () => {
  console.log(`Weather UI server listening on port ${PORT}`);
});

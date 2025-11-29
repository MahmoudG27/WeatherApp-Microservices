import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Env vars
const PORT = process.env.PORT || 4000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const RAPID_API_HOST = "weatherapi-com.p.rapidapi.com";

// ---------------------------
// 🔹 Readiness Probe
// ---------------------------
app.get("/ready", (req, res) => {
  res.status(200).json({ status: "ready" });
});

// ---------------------------
// 🔹 Liveness Probe
// ---------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "alive" });
});

// ---------------------------
// 🔹 Weather API Proxy
// ---------------------------
app.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const response = await axios.get(
      `https://${RAPID_API_HOST}/current.json`,
      {
        params: { q: city },
        headers: {
          "X-RapidAPI-Key": WEATHER_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST
        }
      }
    );

    const data = response.data;

    res.json({
      city: data.location?.name,
      country: data.location?.country,
      temperature: data.current?.temp_c,
      condition: data.current?.condition?.text,
      icon: data.current?.condition?.icon,
      humidity: data.current?.humidity,
      wind: data.current?.wind_kph,
    });

  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ---------------------------
app.listen(PORT, () =>
  console.log(`Weather API proxy running on port ${PORT}`)
);

// weather.js
document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("city").value.trim();
  if (!city) { alert("Enter city"); return; }

  try {
    const token = localStorage.getItem("weather_token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { headers });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to fetch weather");
      return;
    }

    // icon may be returned as "//cdn..." or full url
    let iconUrl = data.icon || "";
    if (iconUrl && iconUrl.startsWith("//")) iconUrl = "https:" + iconUrl;
    if (iconUrl && iconUrl.startsWith("/")) iconUrl = "https:" + iconUrl;

    const resultArea = document.getElementById("resultArea");
    resultArea.innerHTML = `
      <div class="weather-card">
        <div class="weather-icon">
          ${iconUrl ? `<img src="${iconUrl}" alt="icon">` : ""}
        </div>
        <div class="weather-meta">
          <h3>${data.city || city}, ${data.country || ""}</h3>
          <p>${data.condition || data.description || ""}</p>
          <p>Temp: <strong>${data.temperature ?? data.temp ?? "-"} °C</strong></p>
          <p>Humidity: <strong>${data.humidity ?? "-"}%</strong> • Wind: <strong>${data.wind ?? "-" } kph</strong></p>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});

// logout handler
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("weather_token");
  window.location.href = "login.html";
});

// quick check: redirect to login if no token
(function checkAuth() {
  const token = localStorage.getItem("weather_token");
  if (!token) {
    window.location.href = "login.html";
  }
})();

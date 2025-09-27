// src/App.js
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState({}); // store hourly data by date
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric"); // "metric" = °C, "imperial" = °F
  const [expandedDay, setExpandedDay] = useState(null); // for toggling

  const API_KEY = "ff94b9c1fe32f460587dbfd3e24130fe"; // Replace with your key

  // Dynamic background images
  const getBackgroundImage = () => {
    if (!weather) {
      return "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')";
    }

    const condition = weather.weather[0].main.toLowerCase();
    if (condition.includes("clear"))
      return "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80')";
    if (condition.includes("cloud"))
      return "url('https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1950&q=80')";
    if (condition.includes("rain"))
      return "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1950&q=80')";
    if (condition.includes("snow"))
      return "url('https://images.unsplash.com/photo-1608889175361-22dbef52e91f?auto=format&fit=crop&w=1950&q=80')";
    if (condition.includes("thunder"))
      return "url('https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1950&q=80')";
    if (condition.includes("mist") || condition.includes("fog"))
      return "url('https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1950&q=80')";

    return "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')";
  };

  // Fetch weather + forecast
  const fetchWeather = async (selectedCity = city, selectedUnit = unit) => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      // Current weather
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=${selectedUnit}`
      );
      setWeather(response.data);

      // 5-day forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&appid=${API_KEY}&units=${selectedUnit}`
      );

      // Group forecast by day
      const grouped = {};
      forecastRes.data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      const daily = Object.keys(grouped).map((date) => ({
        date,
        data: grouped[date],
        midDay: grouped[date].find((f) => f.dt_txt.includes("12:00:00")) || grouped[date][0],
      }));

      setForecast(daily);
      setHourlyForecast(grouped);

      setError("");
    } catch (err) {
      setError("❌ City not found. Try again!");
      setWeather(null);
      setForecast([]);
      setHourlyForecast({});
    } finally {
      setLoading(false);
    }
  };

  // Toggle °C ↔ °F
  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (city) {
      fetchWeather(city, newUnit);
    }
  };

  // Unit symbols
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "Poppins, Arial, sans-serif",
        backgroundImage: getBackgroundImage(),
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        padding: "20px",
        transition: "background-image 1s ease-in-out",
      }}
    >
      <h1 style={{ fontSize: "40px", margin: "20px 0", textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}>
        🌦 Weather Application
      </h1>

      {/* Search Box */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "12px 15px",
            borderRadius: "25px",
            border: "none",
            outline: "none",
            width: "250px",
            fontSize: "16px",
            marginRight: "10px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
          }}
        />
        <button
          onClick={() => fetchWeather()}
          style={{
            padding: "12px 20px",
            borderRadius: "25px",
            border: "none",
            background: "#007BFF",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
            marginRight: "10px",
          }}
        >
          Search
        </button>

        {/* Unit Toggle */}
        <button
          onClick={toggleUnit}
          style={{
            padding: "12px 20px",
            borderRadius: "25px",
            border: "none",
            background: "#28a745",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          }}
        >
          Switch to {unit === "metric" ? "°F" : "°C"}
        </button>
      </div>

      {/* Loader */}
      {loading && (
        <div
          style={{
            marginTop: "30px",
            border: "6px solid rgba(255,255,255,0.3)",
            borderTop: "6px solid #fff",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            animation: "spin 1s linear infinite",
          }}
        />
      )}

      {/* Error */}
      {error && !loading && (
        <p style={{ color: "yellow", fontWeight: "bold", background: "rgba(0,0,0,0.6)", padding: "10px 20px", borderRadius: "10px" }}>
          {error}
        </p>
      )}

      {/* Current Weather */}
      {weather && !loading && (
        <div
          style={{
            marginTop: "20px",
            padding: "30px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            width: "320px",
            boxShadow: "0px 6px 15px rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <img src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="icon" />
          <h3 style={{ fontSize: "35px", margin: "10px 0" }}>
            {weather.main.temp}{unitSymbol}
          </h3>
          <p style={{ fontStyle: "italic", marginBottom: "15px" }}>{weather.weather[0].description}</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>🌬 Wind Speed: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</p>
        </div>
      )}

      {/* Forecast */}
      {forecast.length > 0 && !loading && (
        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "800px" }}>
          {forecast.map((day, idx) => (
            <div
              key={idx}
              style={{
                padding: "15px",
                borderRadius: "15px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
              onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
            >
              {/* Daily summary */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={`http://openweathermap.org/img/wn/${day.midDay.weather[0].icon}@2x.png`} alt="icon" style={{ width: "40px" }} />
                  <p>{Math.round(day.midDay.main.temp)}{unitSymbol}</p>
                </div>
              </div>

              {/* Hourly forecast (expandable) */}
              {expandedDay === day.date && (
                <div style={{ marginTop: "15px", display: "flex", overflowX: "auto", gap: "10px" }}>
                  {hourlyForecast[day.date].map((hour, i) => (
                    <div
                      key={i}
                      style={{
                        flex: "0 0 auto",
                        padding: "10px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.1)",
                        textAlign: "center",
                        minWidth: "90px",
                      }}
                    >
                      <p style={{ fontSize: "12px" }}>{new Date(hour.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      <img src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`} alt="hourly icon" style={{ width: "40px" }} />
                      <p>{Math.round(hour.main.temp)}{unitSymbol}</p>
                      <p style={{ fontSize: "10px" }}>{hour.weather[0].main}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default App; 


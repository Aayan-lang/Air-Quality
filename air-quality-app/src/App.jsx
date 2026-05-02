import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const API_KEY = "c1103b116485c78e9a3cbc987c4d9f2f";

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const getCoordinates = async (city) => {
    const res = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (res.data.length === 0) throw new Error("City not found");
    return res.data[0];
  };

  const getAirQuality = async (lat, lon) => {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return res.data;
  };

  const handleSearch = async () => {
    try {
      const coord = await getCoordinates(city);
      const aqData = await getAirQuality(coord.lat, coord.lon);
      setData(aqData);
    } catch {
      alert("City not found");
    }
  };

  const addFavorite = () => {
    if (city && !favorites.includes(city)) {
      setFavorites([...favorites, city]);
    }
  };

  const getAQIText = (aqi) => {
    switch (aqi) {
      case 1: return "Good 😊";
      case 2: return "Fair 🙂";
      case 3: return "Moderate 😐";
      case 4: return "Poor 😷";
      case 5: return "Very Poor ☠️";
      default: return "";
    }
  };

  const getHealthAdvice = (aqi) => {
    if (aqi <= 2) return "Air is safe";
    if (aqi === 3) return "Limit outdoor activity";
    return "Avoid going outside";
  };

  return (
    <div className="container">

      {/* Hero Section */}
      <h1 className="title">🌍 Air Intelligence Dashboard</h1>
      <p className="subtitle">
        Real-time air quality insights at a glance
      </p>

      {/* Stats Cards */}
      {data && (
        <div className="cards">
          <div className="card">
            <h3>AQI</h3>
            <p>{data.list[0].main.aqi}</p>
          </div>

          <div className="card">
            <h3>PM2.5</h3>
            <p>{data.list[0].components.pm2_5}</p>
          </div>

          <div className="card">
            <h3>PM10</h3>
            <p>{data.list[0].components.pm10}</p>
          </div>

          <div className="card">
            <h3>CO</h3>
            <p>{data.list[0].components.co}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button className="search-btn" onClick={handleSearch}>
          Analyze →
        </button>
      </div>

    </div>
  );
}

export default App;
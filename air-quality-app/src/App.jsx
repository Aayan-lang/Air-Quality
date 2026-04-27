import { useState, useMemo } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { debounce } from "lodash";

const API_KEY = "YOUR_API_KEY";

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [dark, setDark] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const getCoordinates = async (city) => {
    const res = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (res.data.length === 0) {
      throw new Error("City not found");
    }

    return res.data[0];
  };

  const getAirQuality = async (lat, lon) => {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return res.data;
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (city) => {
        try {
          const coord = await getCoordinates(city);
          const aqData = await getAirQuality(coord.lat, coord.lon);
          setData(aqData);
        } catch (error) {
          alert("City not found");
        }
      }, 800),
    []
  );

  const handleSearch = () => {
    if (!city) return;
    debouncedSearch(city);
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
    if (aqi <= 2) return "Air is safe for outdoor activities";
    if (aqi === 3) return "Limit prolonged outdoor exertion";
    if (aqi >= 4) return "Avoid outdoor activities";
  };

  const addFavorite = () => {
    if (!favorites.includes(city)) {
      setFavorites([...favorites, city]);
    }
  };

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen flex flex-col items-center justify-center px-4`}>

      <h1 className="text-5xl font-bold mb-4">🌍 Air Quality Tracker</h1>

      {/* Dark Mode Button */}
      <button
        onClick={() => setDark(!dark)}
        className="mb-4 px-4 py-2 bg-gray-700 rounded"
      >
        Toggle Mode
      </button>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          className="px-4 py-2 rounded-lg text-black w-64 outline-none"
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 px-5 py-2 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>

        <button
          onClick={addFavorite}
          className="bg-green-500 px-3 py-2 rounded"
        >
          Save
        </button>
      </div>

      {/* Favorites */}
      <div className="mb-4">
        {favorites.map((fav, index) => (
          <button
            key={index}
            onClick={() => setCity(fav)}
            className="mr-2 bg-gray-700 px-2 py-1 rounded"
          >
            {fav}
          </button>
        ))}
      </div>

      {/* Data */}
      {data && (
        <>
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl text-center w-full max-w-md">

            <h2 className="text-3xl font-semibold mb-2">
              AQI: {data.list[0].main.aqi}
            </h2>

            <p className="text-lg">{getAQIText(data.list[0].main.aqi)}</p>

            <p className="mt-2 text-gray-300">
              {getHealthAdvice(data.list[0].main.aqi)}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <p>PM2.5: {data.list[0].components.pm2_5}</p>
              <p>PM10: {data.list[0].components.pm10}</p>
              <p>CO: {data.list[0].components.co}</p>
              <p>NO2: {data.list[0].components.no2}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6 bg-gray-800 p-4 rounded-xl">
            <LineChart
              width={400}
              height={250}
              data={[
                { name: "PM2.5", value: data.list[0].components.pm2_5 },
                { name: "PM10", value: data.list[0].components.pm10 },
                { name: "CO", value: data.list[0].components.co },
                { name: "NO2", value: data.list[0].components.no2 },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const PLANT_NAME = 'Monstera deliciosa';

function LocationInfo() {
  const locations = [
    { name: 'San Francisco, CA', rainfall: '600mm', sunshine: '3.1 hrs/day (Dec) - 10.9 hrs/day (Jun)', soil: 'Loam' },
    { name: 'Los Angeles, CA', rainfall: '380mm', sunshine: '7.5 hrs/day (Dec) - 12.1 hrs/day (Jun)', soil: 'Sandy Loam' },
    { name: 'New York, NY', rainfall: '1200mm', sunshine: '2.5 hrs/day (Dec) - 9.5 hrs/day (Jun)', soil: 'Silt Loam' },
    { name: 'London, UK', rainfall: '600mm', sunshine: '1.6 hrs/day (Dec) - 7.2 hrs/day (Jun)', soil: 'Clay' },
    { name: 'Sydney, AU', rainfall: '1200mm', sunshine: '5.2 hrs/day (Jun) - 8.8 hrs/day (Dec)', soil: 'Sandy' },
    { name: 'Tokyo, JP', rainfall: '1500mm', sunshine: '2.0 hrs/day (Dec) - 5.7 hrs/day (Jun)', soil: 'Andosol' },
    { name: 'Cape Town, ZA', rainfall: '515mm', sunshine: '7.0 hrs/day (Jun) - 11.0 hrs/day (Dec)', soil: 'Sandy' },
    { name: 'Mexico City, MX', rainfall: '750mm', sunshine: '5.5 hrs/day (Dec) - 7.5 hrs/day (Jun)', soil: 'Volcanic' },
    { name: 'Berlin, DE', rainfall: '570mm', sunshine: '1.7 hrs/day (Dec) - 7.3 hrs/day (Jun)', soil: 'Sandy Loam' },
    { name: 'Mumbai, IN', rainfall: '2200mm', sunshine: '7.0 hrs/day (Dec) - 8.5 hrs/day (Jun)', soil: 'Laterite' },
  ];
  const [selected, setSelected] = useState(locations[0]);

  return (
    <section style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
      <h2>🌍 Local Growing Info</h2>
      <label>
        Pick your location:{' '}
        <select
          value={selected.name}
          onChange={e => setSelected(locations.find(loc => loc.name === e.target.value)!)}
        >
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name}</option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Average Rainfall:</strong> {selected.rainfall}</p>
        <p><strong>Average Sunshine:</strong> {selected.sunshine}</p>
        <p><strong>Soil Type:</strong> {selected.soil}</p>
      </div>
    </section>
  );
}

function App() {
  const [plantInfo, setPlantInfo] = useState<{ title: string; extract: string; imageUrl: string } | null>(null);

  useEffect(() => {
    async function fetchPlantData() {
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(PLANT_NAME)}`
      );
      const summaryData = await summaryRes.json();
      setPlantInfo({
        title: summaryData.title,
        extract: summaryData.extract,
        imageUrl: summaryData.originalimage ? summaryData.originalimage.source : '',
      });
    }
    fetchPlantData();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h1>Plant Database App</h1>
      <section style={{ marginBottom: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
        <h2>🌱 Plant of the Day</h2>
        {plantInfo ? (
          <>
            <h3>{plantInfo.title}</h3>
            {plantInfo.imageUrl && (
              <img
                src={plantInfo.imageUrl}
                alt={plantInfo.title}
                style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: '1rem' }}
              />
            )}
            <p>{plantInfo.extract}</p>
            <ul>
              <li><strong>Type:</strong> Tropical</li>
              <li><strong>Water:</strong> Weekly</li>
              <li><strong>Light:</strong> Bright, indirect</li>
              <li>
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(PLANT_NAME)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2d4739', textDecoration: 'underline' }}
                >
                  More on Wikipedia
                </a>
              </li>
            </ul>
          </>
        ) : (
          <p>Loading plant of the day...</p>
        )}
      </section>
      <LocationInfo />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
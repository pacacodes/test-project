import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';

const PLANT_NAME = 'Monstera deliciosa';

function WeatherGraphic({ rainfall, sunshine }: { rainfall: string; sunshine: string }) {
  // Parse rainfall (in mm) and sunshine (hours/day)
  const rainValue = parseInt(rainfall);
  // Get average sunshine from the string (e.g., "3.1 hrs/day (Dec) - 10.9 hrs/day (Jun)")
  const sunMatch = sunshine.match(/([\d.]+)\s*hrs\/day.*-.*([\d.]+)\s*hrs\/day/);
  const sunAvg = sunMatch
    ? (parseFloat(sunMatch[1]) + parseFloat(sunMatch[2])) / 2
    : 6;

  // Decide weather type
  let type: 'sunny' | 'cloudy' | 'rainy' | 'mixed' = 'sunny';
  if (rainValue > 1000 && sunAvg < 6) type = 'rainy';
  else if (rainValue > 700) type = 'mixed';
  else if (sunAvg < 4) type = 'cloudy';
  else type = 'sunny';

  // SVGs for each type
  if (type === 'sunny') {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="20" fill="#FFD700" />
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={40}
            y1={10}
            x2={40}
            y2={0}
            stroke="#FFD700"
            strokeWidth={3}
            transform={`rotate(${i * 45} 40 40)`}
          />
        ))}
      </svg>
    );
  }
  if (type === 'cloudy') {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <ellipse cx="40" cy="50" rx="22" ry="14" fill="#bbb" />
        <ellipse cx="55" cy="45" rx="12" ry="8" fill="#ccc" />
        <ellipse cx="30" cy="45" rx="10" ry="7" fill="#ddd" />
      </svg>
    );
  }
  if (type === 'rainy') {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <ellipse cx="40" cy="50" rx="22" ry="14" fill="#bbb" />
        <ellipse cx="55" cy="45" rx="12" ry="8" fill="#ccc" />
        <ellipse cx="30" cy="45" rx="10" ry="7" fill="#ddd" />
        {/* Rain drops */}
        {[30, 40, 50].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={60}
            x2={x}
            y2={75}
            stroke="#2196F3"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }
  // mixed: sun + cloud
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="25" cy="35" r="12" fill="#FFD700" />
      <ellipse cx="50" cy="50" rx="18" ry="10" fill="#bbb" />
      <ellipse cx="60" cy="45" rx="8" ry="5" fill="#ccc" />
    </svg>
  );
}

function PlantDetailsDialog({
  plant,
  onClose,
}: {
  plant: { title: string; imageUrl: string; extract: string };
  onClose: () => void;
}) {
  if (!plant) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '2rem',
          minWidth: 320,
          maxWidth: 400,
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'
          }}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2>{plant.title}</h2>
        {plant.imageUrl && (
          <img
            src={plant.imageUrl}
            alt={plant.title}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: '1rem' }}
          />
        )}
        <p>{plant.extract}</p>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(plant.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2d4739', textDecoration: 'underline' }}
        >
          More on Wikipedia
        </a>
      </div>
    </div>
  );
}

function SoilDetailsDialog({
  soil,
  onClose,
}: {
  soil: string;
  onClose: () => void;
}) {
  const [info, setInfo] = useState<{ title: string; extract: string; imageUrl?: string } | null>(null);

  useEffect(() => {
    async function fetchSoilInfo() {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(soil + ' soil')}`
      );
      const data = await res.json();
      setInfo({
        title: data.title,
        extract: data.extract,
        imageUrl: data.originalimage ? data.originalimage.source : undefined,
      });
    }
    fetchSoilInfo();
  }, [soil]);

  if (!soil) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '2rem',
          minWidth: 320,
          maxWidth: 400,
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'
          }}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2>{info ? info.title : soil}</h2>
        {info?.imageUrl && (
          <img
            src={info.imageUrl}
            alt={info.title}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: '1rem' }}
          />
        )}
        <p>{info ? info.extract : 'Loading...'}</p>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(soil + ' soil')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2d4739', textDecoration: 'underline' }}
        >
          More on Wikipedia
        </a>
      </div>
    </div>
  );
}

function PlantSuggestions({ plantNames }: { plantNames: string[] }) {
  const [plants, setPlants] = useState<
    { title: string; imageUrl: string; extract: string }[]
  >([]);
  const [selectedPlant, setSelectedPlant] = useState<null | { title: string; imageUrl: string; extract: string }>(null);

  useEffect(() => {
    async function fetchPlants() {
      const results = await Promise.all(
        plantNames.map(async name => {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
          );
          const data = await res.json();
          return {
            title: data.title,
            imageUrl: data.originalimage ? data.originalimage.source : '',
            extract: data.extract,
          };
        })
      );
      setPlants(results);
    }
    fetchPlants();
  }, [plantNames]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🌿 Plants that grow well here:</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {plants.map(plant => (
          <div
            key={plant.title}
            style={{
              width: 140,
              textAlign: 'center',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => setSelectedPlant(plant)}
            tabIndex={0}
            role="button"
            aria-label={`Show details for ${plant.title}`}
          >
            {plant.imageUrl && (
              <img
                src={plant.imageUrl}
                alt={plant.title}
                style={{ width: '100%', maxWidth: 120, borderRadius: 6 }}
              />
            )}
            <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{plant.title}</div>
            <div style={{ fontSize: '0.85em', color: '#555', marginTop: '0.3rem' }}>{plant.extract.slice(0, 60)}...</div>
          </div>
        ))}
      </div>
      {selectedPlant && (
        <PlantDetailsDialog plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
      )}
    </div>
  );
}

function AddressMap({ address }: { address: string }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parcelData, setParcelData] = useState<any>(null);
  const [propertyStats, setPropertyStats] = useState<{ soilType: string; address: string } | null>(null);

  useEffect(() => {
    if (!address.trim()) {
      setCoords(null);
      setError(null);
      setPropertyStats(null);
      return;
    }
    async function fetchCoords() {
      try {
        const apiKey = 'pk.d22d51e22de0121bd7aa2a3f08cfd1a5';
        const res = await fetch(
          `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          setError(null);
          // Dummy soil type assignment based on city in address
          let soilType = 'Unknown';
          if (/los angeles/i.test(address)) soilType = 'Sandy Loam';
          else if (/san francisco/i.test(address)) soilType = 'Loam';
          else if (/new york/i.test(address)) soilType = 'Silt Loam';
          else if (/london/i.test(address)) soilType = 'Clay';
          else if (/sydney/i.test(address)) soilType = 'Sandy';
          else if (/tokyo/i.test(address)) soilType = 'Andosol';
          else if (/cape town/i.test(address)) soilType = 'Sandy';
          else if (/mexico city/i.test(address)) soilType = 'Volcanic';
          else if (/berlin/i.test(address)) soilType = 'Sandy Loam';
          else if (/mumbai/i.test(address)) soilType = 'Laterite';
          setPropertyStats({ soilType, address: data[0].display_name });
        } else {
          setCoords(null);
          setError('Address not found');
          setPropertyStats(null);
        }
      } catch (err) {
        setCoords(null);
        setError('Failed to fetch location');
        setPropertyStats(null);
      }
    }
    fetchCoords();
  }, [address]);

  useEffect(() => {
    fetch('/parcels.geojson')
      .then(res => res.json())
      .then(data => setParcelData(data))
      .catch(() => setParcelData(null));
  }, []);

  if (error) return <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>;
  if (!coords) return null;

  return (
    <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <div style={{ width: 400, height: 300 }}>
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={18}
          maxZoom={19}
          style={{ width: '100%', height: 300, borderRadius: 8, border: '1px solid #ccc' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {parcelData && (
            <GeoJSON data={parcelData} style={{ color: 'red', weight: 1, fillOpacity: 0 }} />
          )}
          <Marker position={[coords.lat, coords.lon]}>
            <Popup>{address}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <div style={{ minWidth: 220 }}>
        <h4>Property Stats</h4>
        {propertyStats ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><strong>Address:</strong> {propertyStats.address}</li>
            <li><strong>Soil Type:</strong> {propertyStats.soilType}</li>
          </ul>
        ) : (
          <p>No property stats available.</p>
        )}
      </div>
    </div>
  );
}

function LocationInfo({
  selected,
  setSelected,
  address,
  setAddress,
  showSoilDialog,
  setShowSoilDialog,
}: {
  selected: {
    name: string;
    rainfall: string;
    sunshine: string;
    soil: string;
  };
  setSelected: (loc: any) => void;
  address: string;
  setAddress: (addr: string) => void;
  showSoilDialog: boolean;
  setShowSoilDialog: (show: boolean) => void;
}) {
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
  const plantMap: Record<string, string[]> = {
    'San Francisco, CA': ['Lavandula', 'Rosemary', 'Camellia', 'Fuchsia'],
    'Los Angeles, CA': ['Bougainvillea', 'Agave', 'Jasmine', 'Bird of Paradise'],
    'New York, NY': ['Hosta', 'Hydrangea', 'Astilbe', 'Daylily'],
    'London, UK': ['Primrose', 'Foxglove', 'Bluebell', 'Holly'],
    'Sydney, AU': ['Grevillea', 'Kangaroo Paw', 'Bottlebrush', 'Lilly Pilly'],
    'Tokyo, JP': ['Azalea', 'Camellia', 'Cherry Blossom', 'Bamboo'],
    'Cape Town, ZA': ['Protea', 'Pelargonium', 'Agapanthus', 'Strelitzia'],
    'Mexico City, MX': ['Dahlia', 'Marigold', 'Bougainvillea', 'Cactus'],
    'Berlin, DE': ['Lilac', 'Peony', 'Geranium', 'Coneflower'],
    'Mumbai, IN': ['Hibiscus', 'Bougainvillea', 'Jasmine', 'Mango'],
  };

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
        <label>
          Or enter your exact address:{' '}
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St, Los Angeles, CA"
            style={{ width: '80%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>
      </div>
      {address.trim() && <AddressMap address={address} />}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <p><strong>Average Rainfall:</strong> {selected.rainfall}</p>
          <p><strong>Average Sunshine:</strong> {selected.sunshine}</p>
          <p>
            <strong>Soil Type:</strong>{' '}
            <span
              style={{ color: '#2d4739', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setShowSoilDialog(true)}
              tabIndex={0}
              role="button"
              aria-label={`Show details for ${selected.soil} soil`}
            >
              {selected.soil}
            </span>
          </p>
        </div>
        <WeatherGraphic rainfall={selected.rainfall} sunshine={selected.sunshine} />
      </div>
      <PlantSuggestions plantNames={plantMap[selected.name]} />
    </section>
  );
}

function App() {
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
  const [address, setAddress] = useState('');
  const [showSoilDialog, setShowSoilDialog] = useState(false);
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
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 700, margin: 'auto' }}>
      <LocationInfo
        selected={selected}
        setSelected={setSelected}
        address={address}
        setAddress={setAddress}
        showSoilDialog={showSoilDialog}
        setShowSoilDialog={setShowSoilDialog}
      />
      {showSoilDialog && (
        <SoilDetailsDialog soil={selected.soil} onClose={() => setShowSoilDialog(false)} />
      )}
      <section style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
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
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
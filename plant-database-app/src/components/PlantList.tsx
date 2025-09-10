import React, { useEffect, useState } from 'react';
import { fetchPlants } from '../services/plantService';
import { Plant } from '../types';

const PlantList: React.FC = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPlants = async () => {
            try {
                const plantData = await fetchPlants();
                setPlants(plantData);
            } catch (err) {
                setError('Failed to load plants');
            } finally {
                setLoading(false);
            }
        };

        loadPlants();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <ul>
            {plants.map((plant) => (
                <li key={plant.id}>{plant.name}</li>
            ))}
        </ul>
    );
};

export default PlantList;
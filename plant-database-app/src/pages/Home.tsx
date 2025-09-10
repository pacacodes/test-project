import React from 'react';
import PlantList from '../components/PlantList';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Plant Database</h1>
            <PlantList />
        </div>
    );
};

export default Home;
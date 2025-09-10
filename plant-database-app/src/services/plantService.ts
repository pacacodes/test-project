import axios from 'axios';
import { Plant, PlantDetails } from '../types';

const API_URL = 'https://api.example.com/plants'; // Replace with your actual API URL

export const fetchPlants = async (): Promise<Plant[]> => {
    try {
        const response = await axios.get<Plant[]>(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching plants:', error);
        throw error;
    }
};

export const fetchPlantById = async (id: string): Promise<PlantDetails> => {
    try {
        const response = await axios.get<PlantDetails>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching plant with id ${id}:`, error);
        throw error;
    }
};
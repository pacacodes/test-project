export interface Plant {
    id: number;
    name: string;
    scientificName: string;
    family: string;
    description: string;
    imageUrl: string;
}

export interface PlantDetails extends Plant {
    careInstructions: string;
    habitat: string;
    toxicity: string;
}
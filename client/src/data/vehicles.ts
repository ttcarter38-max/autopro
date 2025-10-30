import whiteSUV from '@assets/generated_images/White_luxury_SUV_studio_shot_f7358436.png';
import blueSports from '@assets/generated_images/Blue_sports_car_studio_shot_5efd9737.png';
import blackSedan from '@assets/generated_images/Black_luxury_sedan_studio_shot_97a6a2cb.png';
import yellowSports from '@assets/generated_images/Yellow_sports_car_studio_shot_cd261208.png';
import silverCoupe from '@assets/generated_images/Silver_sports_coupe_studio_shot_7e85788f.png';

export interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  condition: 'New' | 'Used';
  year: number;
  transmission: string;
  color: string;
  topSpeed: string;
  featured?: boolean;
  special?: boolean;
}

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Cayenne Turbo',
    make: 'Porsche',
    model: 'Cayenne',
    image: whiteSUV,
    price: 67200,
    rating: 4.5,
    ratingCount: 2136,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'White',
    topSpeed: '159 mph',
    featured: true,
    special: true,
  },
  {
    id: 2,
    name: '911 Carrera S',
    make: 'Porsche',
    model: '911 Carrera',
    image: yellowSports,
    price: 89400,
    rating: 4.8,
    ratingCount: 2147,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Yellow',
    topSpeed: '183 mph',
    featured: true,
    special: true,
  },
  {
    id: 3,
    name: 'Panamera 4S',
    make: 'Porsche',
    model: 'Panamera',
    image: blackSedan,
    price: 80000,
    originalPrice: 85000,
    rating: 4.6,
    ratingCount: 2134,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Black',
    topSpeed: '164 mph',
    featured: true,
    special: true,
  },
  {
    id: 4,
    name: '718 Boxster',
    make: 'Porsche',
    model: 'Boxster',
    image: blueSports,
    price: 56000,
    rating: 4.7,
    ratingCount: 2202,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Blue',
    topSpeed: '170 mph',
    featured: true,
    special: true,
  },
  {
    id: 5,
    name: 'Macan GTS',
    make: 'Porsche',
    model: 'Macan',
    image: silverCoupe,
    price: 65000,
    originalPrice: 67200,
    rating: 4.4,
    ratingCount: 2129,
    condition: 'Used',
    year: 2023,
    transmission: 'Automatic',
    color: 'Silver',
    topSpeed: '159 mph',
    featured: true,
  },
  {
    id: 6,
    name: 'Cayenne S',
    make: 'Porsche',
    model: 'Cayenne',
    image: whiteSUV,
    price: 72000,
    rating: 4.6,
    ratingCount: 1985,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Pearl White',
    topSpeed: '164 mph',
  },
  {
    id: 7,
    name: '911 Turbo',
    make: 'Porsche',
    model: '911 Carrera',
    image: yellowSports,
    price: 125000,
    rating: 4.9,
    ratingCount: 2543,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Racing Yellow',
    topSpeed: '198 mph',
  },
  {
    id: 8,
    name: 'Panamera Turbo',
    make: 'Porsche',
    model: 'Panamera',
    image: blackSedan,
    price: 95000,
    rating: 4.7,
    ratingCount: 1876,
    condition: 'Used',
    year: 2023,
    transmission: 'Automatic',
    color: 'Jet Black',
    topSpeed: '177 mph',
  },
  {
    id: 9,
    name: '718 Cayman',
    make: 'Porsche',
    model: 'Boxster',
    image: blueSports,
    price: 62000,
    rating: 4.5,
    ratingCount: 1654,
    condition: 'New',
    year: 2024,
    transmission: 'Automatic',
    color: 'Miami Blue',
    topSpeed: '171 mph',
  },
  {
    id: 10,
    name: 'Macan S',
    make: 'Porsche',
    model: 'Macan',
    image: silverCoupe,
    price: 58000,
    rating: 4.3,
    ratingCount: 1432,
    condition: 'Used',
    year: 2022,
    transmission: 'Automatic',
    color: 'GT Silver',
    topSpeed: '157 mph',
  },
];

export const getMakes = () => {
  const makes = Array.from(new Set(vehicles.map(v => v.make)));
  return makes.sort();
};

export const getModels = (make?: string) => {
  const filtered = make ? vehicles.filter(v => v.make === make) : vehicles;
  const models = Array.from(new Set(filtered.map(v => v.model)));
  return models.sort();
};

export const filterVehicles = (filters: {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'New' | 'Used';
}) => {
  return vehicles.filter(vehicle => {
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.minPrice && vehicle.price < filters.minPrice) return false;
    if (filters.maxPrice && vehicle.price > filters.maxPrice) return false;
    if (filters.condition && vehicle.condition !== filters.condition) return false;
    return true;
  });
};

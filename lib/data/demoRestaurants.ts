import { Restaurant } from '../types/restaurant';

export const demoRestaurants: Restaurant[] = [
  {
    id: 'rest-001',
    name: 'La Bella Vista',
    address: '123 Main Street',
    city: 'New York',
    phone: '+1 (555) 123-4567',
    type: 'fine-dining',
  },
  {
    id: 'rest-002',
    name: 'The Urban Kitchen',
    address: '456 Park Avenue',
    city: 'New York',
    phone: '+1 (555) 234-5678',
    type: 'casual',
  },
  {
    id: 'rest-003',
    name: 'Sunrise Café',
    address: '789 Broadway',
    city: 'Brooklyn',
    phone: '+1 (555) 345-6789',
    type: 'cafe',
  },
  {
    id: 'rest-004',
    name: 'Quick Bites Express',
    address: '321 Queens Boulevard',
    city: 'Queens',
    phone: '+1 (555) 456-7890',
    type: 'fast-food',
  },
];

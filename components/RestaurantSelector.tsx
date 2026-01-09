'use client';

import { Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types/restaurant';
import { demoRestaurants } from '@/lib/data/demoRestaurants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

export default function RestaurantSelector() {
  const [restaurants] = useState<Restaurant[]>(demoRestaurants);
  const [selectedRestaurant, setSelectedRestaurantState] =
    useState<Restaurant | null>(() => {
      // Load selected restaurant from localStorage or use first one
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('selectedRestaurant');
        if (stored) {
          try {
            const storedRestaurant = JSON.parse(stored);
            // Verify the restaurant still exists in the demo data
            const exists = demoRestaurants.find(
              (r) => r.id === storedRestaurant.id
            );
            if (exists) {
              return exists;
            }
          } catch (error) {
            console.error('Error loading selected restaurant:', error);
          }
        }
      }
      return demoRestaurants[0] || null;
    });

  // Save to localStorage and update state
  const setSelectedRestaurant = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      setSelectedRestaurantState(restaurant);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('restaurantChanged'));
      }
    }
  };

  // Save selected restaurant to localStorage
  useEffect(() => {
    if (selectedRestaurant && typeof window !== 'undefined') {
      localStorage.setItem(
        'selectedRestaurant',
        JSON.stringify(selectedRestaurant)
      );
    }
  }, [selectedRestaurant]);

  if (!selectedRestaurant || restaurants.length === 0) {
    return (
      <div className="w-auto min-w-[200px] bg-white border-slate-200 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Store className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-left">
            <p className="text-sm text-slate-500">No restaurants found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Select value={selectedRestaurant.id} onValueChange={setSelectedRestaurant}>
      <SelectTrigger className="w-auto min-w-[200px] bg-white border-slate-200 rounded-lg px-4 py-2 h-auto hover:bg-slate-50 transition-colors shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900">
              {selectedRestaurant.name}
            </p>
            <p className="text-xs text-slate-500">{selectedRestaurant.city}</p>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent className="w-80">
        {restaurants.map((restaurant) => (
          <SelectItem
            key={restaurant.id}
            value={restaurant.id}
            className="cursor-pointer"
          >
            <div className="flex items-start space-x-3 py-2">
              <div
                className={`p-2 rounded-lg ${
                  selectedRestaurant.id === restaurant.id
                    ? 'bg-blue-100'
                    : 'bg-slate-100'
                }`}
              >
                <Store
                  className={`w-5 h-5 ${
                    selectedRestaurant.id === restaurant.id
                      ? 'text-blue-600'
                      : 'text-slate-600'
                  }`}
                />
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium ${
                    selectedRestaurant.id === restaurant.id
                      ? 'text-blue-900'
                      : 'text-slate-900'
                  }`}
                >
                  {restaurant.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {restaurant.address}
                </p>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/ui/header';
import Main from '@/components/ui/main';
import RestaurantSelector from '@/components/RestaurantSelector';
import TableLayoutEditor from '@/components/Reservations/TableLayoutEditor';
import ReservationsList from '@/components/Reservations/ReservationsList';

import { RESERVATION_TIME_SLOTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Reservation, RestaurantTable } from '@/lib/types';
import {
  loadReservations,
  saveReservations,
  saveSlotLayoutForOneHour,
} from '@/lib/helpers/reservations-storage';
import { Textarea } from '@/components/ui/textarea';

type ReservationDraft = {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes: string;
};

function getSelectedRestaurantId(): string {
  if (typeof window === 'undefined') return 'rest-001';
  const raw = localStorage.getItem('selectedRestaurant');
  if (!raw) return 'rest-001';
  try {
    const parsed = JSON.parse(raw) as { id?: string };
    return parsed?.id || 'rest-001';
  } catch {
    return 'rest-001';
  }
}

export default function ReservationsPage() {
  const [restaurantId, setRestaurantId] = useState<string>(() => getSelectedRestaurantId());
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('floor-1');
  const [selectedTables, setSelectedTables] = useState<RestaurantTable[]>([]);
  const [layoutByFloor, setLayoutByFloor] = useState<Record<string, RestaurantTable[]>>({});

  // Keep in sync with RestaurantSelector (same-tab) changes
  useEffect(() => {
    const onChange = () => setRestaurantId(getSelectedRestaurantId());
    window.addEventListener('restaurantChanged', onChange);
    return () => window.removeEventListener('restaurantChanged', onChange);
  }, []);

  const [draft, setDraft] = useState<ReservationDraft>(() => ({
    date: '',
    time: RESERVATION_TIME_SLOTS[0] ?? '19:00',
    guests: 2,
    name: '',
    phone: '',
    notes: '',
  }));

  // Set today's date on the client to avoid build-time "current time" prerender errors.
  useEffect(() => {
    setDraft((d) => {
      if (d.date) return d;
      const today = new Date().toISOString().split('T')[0];
      return { ...d, date: today };
    });
  }, []);

  const minGuests = 1;
  const guestsLabel = useMemo(() => {
    const g = draft.guests;
    return `${g} ${g === 1 ? 'guest' : 'guests'}`;
  }, [draft.guests]);

  const selectedCapacity = useMemo(() => {
    return selectedTables.reduce((sum, t) => sum + (t.capacity ?? 0), 0);
  }, [selectedTables]);

  const handleSelectionChange = useCallback(
    ({ floorId, selectedTables }: { floorId: string; selectedTables: RestaurantTable[] }) => {
      setSelectedFloorId(floorId);
      setSelectedTables(selectedTables);
    },
    []
  );

  const handleLayoutChange = useCallback(
    ({ floorId, tables }: { floorId: string; tables: RestaurantTable[] }) => {
      setLayoutByFloor((prev) => {
        const prevTables = prev[floorId];
        // Avoid pointless state updates if nothing changed.
        if (prevTables === tables) return prev;
        return { ...prev, [floorId]: tables };
      });
    },
    []
  );

  const handleFinalizeReservation = () => {
    if (!draft.date) {
      toast.error('Please select a date');
      return;
    }
    if (!draft.time) {
      toast.error('Please select a time');
      return;
    }
    if (!draft.name.trim()) {
      toast.error('Reservation name is required');
      return;
    }
    if (!draft.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (selectedTables.length === 0) {
      toast.error('Select at least one available table on the canvas');
      return;
    }

    if (selectedCapacity < draft.guests) {
      toast.error('Selected tables do not have enough capacity for these guests');
      return;
    }

    const layoutTables = layoutByFloor[selectedFloorId];
    if (!layoutTables || layoutTables.length === 0) {
      toast.error('Could not read current layout for this floor');
      return;
    }

    // Persist the current layout from this time onwards (1 hour, 15-min steps)
    // so the floor stays consistent while the reservation is active.
    saveSlotLayoutForOneHour({
      restaurantId,
      floorId: selectedFloorId,
      date: draft.date,
      time: draft.time,
      tables: layoutTables.map((t) => ({ ...t, status: 'available' })),
    });

    const newReservation: Reservation = {
      id: `reservation-${Date.now()}`,
      restaurant_id: restaurantId,
      customer_name: draft.name.trim(),
      customer_phone: draft.phone.trim(),
      date: draft.date,
      time: draft.time,
      number_of_guests: draft.guests,
      table_ids: selectedTables.map((t) => t.id),
      floor_id: selectedFloorId,
      status: 'confirmed',
      special_requests: draft.notes.trim() ? draft.notes.trim() : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'local-manager',
    };

    const existing = loadReservations(restaurantId);
    saveReservations(restaurantId, [newReservation, ...existing]);
    toast.success('Reservation created');
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reservation Management
            </h1>
            <p className="text-slate-600 text-sm">
              Create reservations and manage default floor layouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RestaurantSelector />
        </div>
      </Header>

      <Main>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: reservation draft */}
          <div className="lg:col-span-4">
            <Card className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                New reservation
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Select date, time, and guests. Then pick available tables on the
                canvas and finalize.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reservation-date">Date</Label>
                  <Input
                    id="reservation-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, date: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Select
                    value={draft.time}
                    onValueChange={(v) => setDraft((d) => ({ ...d, time: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESERVATION_TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reservation-guests">Guests</Label>
                  <Input
                    id="reservation-guests"
                    type="number"
                    min={minGuests}
                    value={draft.guests}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isFinite(next)) return;
                      setDraft((d) => ({ ...d, guests: Math.max(minGuests, next) }));
                    }}
                  />
                  <p className="text-xs text-slate-500">{guestsLabel}</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reservation-name">Reservation name</Label>
                  <Input
                    id="reservation-name"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="e.g. John Smith"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reservation-phone">Phone number</Label>
                  <Input
                    id="reservation-phone"
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="e.g. +49 123 456789"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reservation-notes">Notes</Label>
                  <Textarea
                    id="reservation-notes"
                    value={draft.notes}
                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Any special requests…"
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Floor</span>
                    <span className="font-semibold text-slate-900">
                      {selectedFloorId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-600">Selected tables</span>
                    <span className="font-semibold text-slate-900">
                      {selectedTables.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-600">Selected capacity</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCapacity}
                    </span>
                  </div>
                  {selectedTables.length > 0 && (
                    <p className="mt-2 text-xs text-slate-600">
                      {selectedTables
                        .map((t) => `T${t.number}`)
                        .sort((a, b) => a.localeCompare(b))
                        .join(', ')}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleFinalizeReservation}
                  disabled={
                    !draft.date ||
                    !draft.time ||
                    !draft.name.trim() ||
                    !draft.phone.trim() ||
                    selectedTables.length === 0
                  }
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-lg disabled:bg-slate-300"
                >
                  Finalize reservation (1 hour)
                </Button>
              </div>
            </Card>

            <div className="mt-6">
              <ReservationsList restaurantId={restaurantId} refreshKey={refreshKey} />
            </div>
          </div>

          {/* Right: layout + selection canvas */}
          <div className="lg:col-span-8">
            <TableLayoutEditor
              restaurantId={restaurantId}
              date={draft.date}
              time={draft.time}
              guests={draft.guests}
              refreshKey={refreshKey}
              onSelectionChange={handleSelectionChange}
              onLayoutChange={handleLayoutChange}
            />
          </div>
        </div>
      </Main>
    </>
  );
}


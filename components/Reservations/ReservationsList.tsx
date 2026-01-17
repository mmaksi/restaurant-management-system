'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Users, Phone } from 'lucide-react';

import type { Reservation } from '@/lib/types';
import { loadReservations } from '@/lib/helpers/reservations-storage';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function sortReservations(a: Reservation, b: Reservation) {
  const aKey = `${a.date} ${a.time}`.trim();
  const bKey = `${b.date} ${b.time}`.trim();
  return bKey.localeCompare(aKey); // newest first (date/time desc)
}

export default function ReservationsList({
  restaurantId,
  refreshKey,
}: {
  restaurantId: string;
  refreshKey: number;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    setReservations(loadReservations(restaurantId));
  }, [restaurantId, refreshKey]);

  const sorted = useMemo(() => {
    return [...reservations].sort(sortReservations);
  }, [reservations]);

  return (
    <Card className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Reservations</h2>
          <p className="text-sm text-slate-600">
            All reservations for this restaurant.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{sorted.length}</span>{' '}
          total
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-sm text-slate-500">No reservations yet.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </span>
              </TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guests
                </span>
              </TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Tables</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.date}</TableCell>
                <TableCell>{r.time}</TableCell>
                <TableCell className="min-w-[160px]">
                  {r.customer_name}
                </TableCell>
                <TableCell className="min-w-[140px]">{r.customer_phone}</TableCell>
                <TableCell>{r.number_of_guests}</TableCell>
                <TableCell>{r.floor_id}</TableCell>
                <TableCell className="min-w-[120px]">
                  {r.table_ids
                    .map((id) => id.replace('table-', 'T'))
                    .join(', ')}
                </TableCell>
                <TableCell className="max-w-[260px] whitespace-normal">
                  {r.special_requests || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}


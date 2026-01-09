'use client';

import { Booking } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Users, AlertCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface BookingsOverlayProps {
  bookings: Booking[];
  dateStr: string;
  hours: number[];
  totalWidth: number; // Total width of all employee columns
}

export default function BookingsOverlay({
  bookings,
  dateStr,
  hours,
}: BookingsOverlayProps) {
  // Filter bookings for this date
  const dayBookings = bookings.filter((booking) => booking.date === dateStr);

  // Group bookings by hour
  const bookingsByHour = dayBookings.reduce((acc, booking) => {
    const hour = parseInt(booking.time.split(':')[0]);
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(booking);
    return acc;
  }, {} as Record<number, Booking[]>);

  const [openBooking, setOpenBooking] = useState<string | null>(null);

  return (
    <>
      {Object.entries(bookingsByHour).map(([hourStr, hourBookings]) => {
        const hour = parseInt(hourStr);
        const hourIndex = hours.indexOf(hour);
        if (hourIndex === -1) return null;

        const totalGuests = hourBookings.reduce(
          (sum, b) => sum + b.numberOfGuests,
          0
        );
        const hasSpecialRequests = hourBookings.some((b) => b.specialRequests);

        return (
          <div
            key={hour}
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: `${(hour - 7) * 60}px`,
              height: '60px',
              zIndex: 25,
            }}
          >
            <button
              type="button"
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-b border-blue-300 px-2 py-1.5 flex items-center gap-2 text-xs pointer-events-auto hover:from-blue-100 hover:to-blue-200 transition-colors group shadow-sm cursor-pointer"
              onClick={() => setOpenBooking(`${dateStr}-${hour}`)}
              style={{ zIndex: 25 }}
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Badge
                  variant="default"
                  className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 h-auto border-blue-700 flex items-center gap-1 flex-shrink-0"
                >
                  <Users className="w-3 h-3" />
                  {hourBookings.length}
                </Badge>
                <span className="font-semibold text-blue-900">
                  {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                </span>
                <span className="text-blue-600">•</span>
                <span className="text-blue-700 text-[10px] font-medium">
                  {format(
                    parseISO(`${dateStr}T${hourBookings[0].time}`),
                    'h:mm a'
                  )}
                </span>
                {hasSpecialRequests && (
                  <>
                    <span className="text-blue-600">•</span>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-700 italic text-[10px]">
                      Requests
                    </span>
                  </>
                )}
              </div>
              {/* Day indicator badge on the right */}
              <Badge
                variant="default"
                className="bg-blue-700 text-white text-[9px] px-1.5 py-0.5 h-auto border-blue-800 flex-shrink-0"
              >
                {format(parseISO(dateStr), 'EEE')}
              </Badge>
            </button>

            {/* Modal Dialog */}
            <Dialog
              open={openBooking === `${dateStr}-${hour}`}
              onOpenChange={(open) => {
                if (!open) setOpenBooking(null);
              }}
            >
              <DialogContent className="max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">
                    {format(parseISO(dateStr), 'EEEE, MMM d')}
                  </DialogTitle>
                  <DialogDescription>
                    Bookings at{' '}
                    {format(
                      parseISO(`${dateStr}T${hourBookings[0].time}`),
                      'h:mm a'
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {hourBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100 transition-colors gap-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          {booking.reservationName}
                        </span>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {booking.numberOfGuests}
                        </Badge>
                      </div>
                      {booking.phone && (
                        <div className="text-sm text-slate-600 mb-2 flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {booking.phone}
                        </div>
                      )}
                      {booking.specialRequests && (
                        <Badge
                          variant="outline"
                          className="text-sm text-amber-800 bg-amber-50 border-amber-300 italic mt-2 w-full justify-start py-2"
                        >
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {booking.specialRequests}
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      })}
    </>
  );
}

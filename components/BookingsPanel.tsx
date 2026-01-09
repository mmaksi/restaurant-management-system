'use client';

import { Booking } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, Clock, Phone, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BookingsPanelProps {
  bookings: Booking[];
}

export default function BookingsPanel({ bookings }: BookingsPanelProps) {
  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // Sort dates
  const sortedDates = Object.keys(bookingsByDate).sort();

  // Sort bookings within each date by time
  sortedDates.forEach((date) => {
    bookingsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEE, MMM d');
    } catch {
      return dateString;
    }
  };

  const getTotalGuestsForDate = (dateBookings: Booking[]) => {
    return dateBookings.reduce(
      (sum, booking) => sum + booking.numberOfGuests,
      0
    );
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-900">
            Upcoming Bookings
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Review reservations to plan staffing needs for next week
        </p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No bookings scheduled for next week</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {sortedDates.map((date) => {
            const dateBookings = bookingsByDate[date];
            const totalGuests = getTotalGuestsForDate(dateBookings);

            return (
              <div
                key={date}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50"
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="font-semibold text-slate-900">
                      {formatDate(date)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      {dateBookings.length}{' '}
                      {dateBookings.length === 1 ? 'booking' : 'bookings'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{totalGuests} guests</span>
                    </div>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-2">
                  {dateBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-lg p-3 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-900">
                              {booking.time}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-medium text-slate-800 truncate">
                              {booking.reservationName}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 ml-6 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>
                                {booking.numberOfGuests}{' '}
                                {booking.numberOfGuests === 1
                                  ? 'guest'
                                  : 'guests'}
                              </span>
                            </div>
                            {booking.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {booking.phone}
                                </span>
                              </div>
                            )}
                          </div>
                          {booking.specialRequests && (
                            <div className="mt-2 ml-6 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="italic">
                                {booking.specialRequests}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {sortedDates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Total bookings:{' '}
              <span className="font-semibold text-slate-900">
                {bookings.length}
              </span>
            </span>
            <span className="text-slate-600">
              Total guests:{' '}
              <span className="font-semibold text-slate-900">
                {bookings.reduce((sum, b) => sum + b.numberOfGuests, 0)}
              </span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

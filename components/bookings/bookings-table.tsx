'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Search, Eye, Calendar } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { BookingDetailsSheet } from '@/components/bookings/booking-details-sheet';

interface BookingsTableProps {
  onEdit: (booking: any) => void;
  onDelete: (booking: any) => void;
  refreshKey: number;
}

export function BookingsTable({ onEdit, onDelete, refreshKey }: BookingsTableProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            customers (
              id,
              surname,
              first_name
            ),
            classes (
              id,
              name,
              fee_amount,
              instructor_id,
              instructors (
                id,
                name
              )
            ),
            payments (
              id,
              amount,
              payment_method,
              payment_status,
              payment_date,
              receipt_number,
              transaction_id,
              notes
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [refreshKey]);

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    const customerName = `${booking.customers?.surname}, ${booking.customers?.first_name}`.toLowerCase();
    const className = booking.classes?.name.toLowerCase();
    const instructorName = booking.classes?.instructors?.name.toLowerCase();
    const searchString = searchTerm.toLowerCase();

    // Text search filter
    const matchesSearch = 
      customerName.includes(searchString) ||
      className.includes(searchString) ||
      instructorName.includes(searchString);

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from && dateRange.to) {
      const bookingDate = parseISO(booking.created_at);
      matchesDateRange = isWithinInterval(bookingDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    }

    return matchesSearch && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              selected={{ 
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={(range) => {
                setDateRange({
                  from: range?.from,
                  to: range?.to
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {(dateRange.from || dateRange.to) && (
          <Button
            variant="ghost"
            onClick={() => setDateRange({ from: undefined, to: undefined })}
          >
            Reset Dates
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.customers?.surname}, {booking.customers?.first_name}
                </TableCell>
                <TableCell>{booking.classes?.name}</TableCell>
                <TableCell>{booking.classes?.instructors?.name}</TableCell>
                <TableCell>{booking.term}</TableCell>
                <TableCell>
                  <Badge variant={booking.is_free_trial ? "secondary" : "default"}>
                    {booking.is_free_trial ? "Free Trial" : "Regular"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(booking)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BookingDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        booking={selectedBooking}
        onEdit={() => {
          setIsDetailsOpen(false);
          onEdit(selectedBooking);
        }}
      />
    </div>
  );
}
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { BookingModal } from './booking-modal';
import { BookingDetailsSheet } from './booking-details-sheet';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

interface ClassBookingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
}

export function ClassBookingsModal({
  open,
  onOpenChange,
  classData,
}: ClassBookingsModalProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  
  const supabase = createBrowserClient();

  if (!classData) return null;

  const handleCreateBooking = async (data: any) => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          customer_id: data.customerId,
          class_id: classData.id,
          term: data.term,
        }])
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
        .single();

      if (bookingError) throw bookingError;

      // Update the classData.bookings array with the new booking
      if (bookingData) {
        classData.bookings = [...(classData.bookings || []), bookingData];
      }

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });
      setIsBookingModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = async (booking: any) => {
    try {
      // Fetch the complete booking data including payments
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
        .eq('id', booking.id)
        .single();

      if (error) throw error;

      setSelectedBooking(data);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Class Bookings - {classData.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {classData.time} • {classData.venue}
                </p>
                <p className="text-sm text-muted-foreground">
                  Instructor: {classData.instructors?.name}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsBookingModalOpen(true)}
                className="h-8"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.bookings?.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.customers?.surname}, {booking.customers?.first_name}
                      </TableCell>
                      <TableCell>{booking.term}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!classData.bookings?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onSubmit={handleCreateBooking}
        preSelectedClassId={classData.id}
      />

      <BookingDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        booking={selectedBooking}
        onEdit={() => {
          setIsDetailsOpen(false);
          // Handle edit if needed
        }}
      />
    </>
  );
}
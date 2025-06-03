'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingsTable } from '@/components/bookings/bookings-table';
import { BookingModal } from '@/components/bookings/booking-modal';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

export default function BookingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const supabase = createBrowserClient();

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (booking: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedBooking) {
        // Update existing booking
        const { error } = await supabase
          .from('bookings')
          .update({
            customer_id: data.customerId,
            class_id: data.classId,
            term: data.term,
            is_free_trial: data.isFreeTrial,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedBooking.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Booking updated successfully',
        });
      } else {
        // Create new booking
        const { error } = await supabase.from('bookings').insert([{
          customer_id: data.customerId,
          class_id: data.classId,
          term: data.term,
          is_free_trial: data.isFreeTrial,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Booking created successfully',
        });
      }

      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </div>

      <BookingsTable 
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshKey={refreshKey}
      />

      <BookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        booking={selectedBooking}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createBrowserClient } from '@/lib/supabase/client';

const bookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  classId: z.string().min(1, 'Class is required'),
  term: z.enum(['Term1', 'Term2', 'Term3', 'Term4'], {
    required_error: 'Term is required',
  }),
  isFreeTrial: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: any;
  onSubmit: (data: BookingFormValues) => void;
  preSelectedClassId?: string;
}

export function BookingModal({
  open,
  onOpenChange,
  booking,
  onSubmit,
  preSelectedClassId,
}: BookingModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: '',
      classId: preSelectedClassId || '',
      term: 'Term1',
      isFreeTrial: false,
    },
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      const [customersResponse, classesResponse] = await Promise.all([
        supabase
          .from('customers')
          .select('id, surname, first_name')
          .order('surname'),
        supabase
          .from('classes')
          .select('id, name, instructor_id, instructors(name)')
          .order('name'),
      ]);

      if (customersResponse.data) setCustomers(customersResponse.data);
      if (classesResponse.data) setClasses(classesResponse.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (booking) {
      form.reset({
        customerId: booking.customer_id,
        classId: booking.class_id,
        term: booking.term,
        isFreeTrial: booking.is_free_trial,
      });
    } else {
      form.reset({
        customerId: '',
        classId: preSelectedClassId || '',
        term: 'Term1',
        isFreeTrial: false,
      });
    }
  }, [booking, form, preSelectedClassId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {booking ? 'Edit Booking' : 'Add Booking'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.surname}, {customer.first_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!preSelectedClassId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.instructors?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Term1">Term 1</SelectItem>
                      <SelectItem value="Term2">Term 2</SelectItem>
                      <SelectItem value="Term3">Term 3</SelectItem>
                      <SelectItem value="Term4">Term 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFreeTrial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Free Trial Class</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {booking ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
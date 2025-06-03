'use client';

import { useEffect } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  contactNo: z.string().min(1, 'Contact number is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type InstructorFormValues = z.infer<typeof instructorSchema>;

interface InstructorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: any;
  onSubmit: (data: InstructorFormValues) => void;
}

export function InstructorModal({
  open,
  onOpenChange,
  instructor,
  onSubmit
}: InstructorModalProps) {
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      name: '',
      email: '',
      contactNo: '',
      specialty: '',
      address: '',
      description: '',
 image: undefined
    },
  });

  const handleFormSubmit = async (data: InstructorFormValues) => {
    let imageLink = instructor?.image_link || '';

    if (data.image) {
      const file = data.image;
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error } = await supabase.storage
        .from('instructor-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Image Upload Failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('instructor-images')
        .getPublicUrl(uploadData.path);
      imageLink = publicUrlData.publicUrl;
    }

    // Exclude the File object from the data passed to onSubmit
    const { image, ...formData } = data;
    onSubmit({ ...formData, imageLink } as InstructorFormValues);
  };

  useEffect(() => {
    if (instructor) {
      form.reset({
        name: instructor.name,
        email: instructor.email,
        contactNo: instructor.contact_no,
        specialty: instructor.specialty,
        address: instructor.address,
        description: instructor.description || '',
        // imageLink is not reset here as the upload field is separate
      });
    } else {
      form.reset({
        name: '',
        email: '',
        contactNo: '',
        specialty: '',
        address: '',
        description: '',
        image: undefined,
      });
    }
  }, [instructor, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {instructor ? 'Edit Instructor' : 'Add Instructor'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <FormControl>
                    <Input placeholder="Yoga, Pilates, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter instructor's bio and experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the instructor's background, certifications, and teaching style.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Profile Image Upload</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(event) => onChange(event.target.files && event.target.files[0])}/>
                  </FormControl>
                  <FormDescription>
                    Enter a valid URL for the instructor's profile image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                {instructor ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
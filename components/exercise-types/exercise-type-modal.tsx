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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

const exerciseTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  whatToBring: z.string().transform((val) => val.split('\n').filter(Boolean)),
  duration: z.string().min(1, 'Duration is required'),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  image: z.instanceof(File).optional(),
});

type ExerciseTypeFormValues = z.infer<typeof exerciseTypeSchema>;

interface ExerciseTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseType?: any;
  onSubmit: (data: ExerciseTypeFormValues) => void;
}

export function ExerciseTypeModal({
  open,
  onOpenChange,
  exerciseType,
  onSubmit,
}: ExerciseTypeModalProps) {
  const supabase = createBrowserClient();
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<ExerciseTypeFormValues>({
    resolver: zodResolver(exerciseTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      whatToBring: '',
      duration: '60',
      cost: 0,
      image: undefined,
    },
  });

  const { toast } = useToast();

  const handleFormSubmit = async (data: ExerciseTypeFormValues) => {
    let imageLink = exerciseType?.image_link || '';

    if (data.image) {
      setIsUploading(true);
      const file = data.image;
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error } = await supabase.storage
        .from('exercise-type-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Image Upload Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('exercise-type-images')
        .getPublicUrl(uploadData.path);
      imageLink = publicUrlData.publicUrl;
      setIsUploading(false);
    }

    onSubmit({ ...data, imageLink: imageLink } as ExerciseTypeFormValues);
  };

  useEffect(() => {
    if (exerciseType) {
      form.reset({
        name: exerciseType.name,
        description: exerciseType.description,
        whatToBring: exerciseType.what_to_bring?.join('\n') || '',
        duration: exerciseType.duration.toString(), // Ensure duration is string for input type="number"
        cost: exerciseType.cost, 
      });
    } else {
      form.reset(); // Reset to default values when no exerciseType is provided
    }
  }, [exerciseType, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {exerciseType ? 'Edit Exercise Type' : 'Add Exercise Type'}
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
                    <Input placeholder="Yoga" {...field} />
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
                      placeholder="A gentle form of exercise..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Image Upload</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(event) => onChange(event.target.files && event.target.files[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatToBring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What to Bring (one item per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Yoga mat&#10;Water bottle&#10;Towel"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              <Button type="submit" disabled={isUploading}>
                {exerciseType ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
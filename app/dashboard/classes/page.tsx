'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassesTable } from '@/components/classes/classes-table';
import { ClassModal } from '@/components/classes/class-modal';
import { ClassDetails } from '@/components/classes/class-details';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const supabase = createBrowserClient();

  const handleEdit = (classData: any) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleView = (classData: any) => {
    setSelectedClass(classData);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update({
            name: data.name,
            code: data.code,
            exercise_type_id: data.exerciseTypeId,
            venue: data.venue,
            address: data.address,
            zip_code: data.zipCode,
            date: data.date,
            time: data.time,
            instructor_id: data.instructorId,
            fee_criteria: data.feeCriteria,
            fee_amount: data.feeAmount,
            term: data.term,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedClass.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Class updated successfully',
        });
      } else {
        // Create new class
        const { error } = await supabase.from('classes').insert([{
          name: data.name,
          code: data.code,
          exercise_type_id: data.exerciseTypeId,
          venue: data.venue,
          address: data.address,
          zip_code: data.zipCode,
          date: data.date,
          time: data.time,
          instructor_id: data.instructorId,
          fee_criteria: data.feeCriteria,
          fee_amount: data.feeAmount,
          term: data.term,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Class created successfully',
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
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <ClassesTable
        onEdit={handleEdit}
        onView={handleView}
        refreshKey={refreshKey}
      />

      <ClassModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classData={selectedClass}
        onSubmit={handleSubmit}
      />

      <ClassDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        classData={selectedClass}
      />
    </div>
  );
}
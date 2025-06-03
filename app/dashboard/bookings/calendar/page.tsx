'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassBookingsModal } from '@/components/bookings/class-bookings-modal';
import { createBrowserClient } from '@/lib/supabase/client';

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            instructors (
              id,
              name
            ),
            bookings (
              id,
              customers (
                id,
                surname,
                first_name
              )
            )
          `)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'))
          .order('date');

        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [date, refreshKey]);

  const handlePreviousWeek = () => {
    setDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleClassClick = (classData: any) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-7 gap-px border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-muted px-2 py-3 text-center text-sm font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-24 gap-px">
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const currentDate = addDays(startDate, dayIndex);
            const dayClasses = classes.filter(
              cls => format(new Date(cls.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
            );

            return (
              <div
                key={dayIndex}
                className="relative min-h-[120px] bg-background p-2"
              >
                <div className="sticky top-0 z-10 -mx-2 -mt-2 bg-muted px-2 py-1 text-sm">
                  {format(currentDate, 'MMM d')}
                </div>
                <div className="space-y-1">
                  {dayClasses.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => handleClassClick(cls)}
                      className="group relative w-full rounded-md bg-primary/10 p-2 text-left hover:bg-primary/20"
                    >
                      <p className="text-sm font-medium">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls.time} • {cls.venue}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls.instructors?.name}
                      </p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {cls.bookings?.length || 0} bookings
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ClassBookingsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classData={selectedClass}
      />
    </div>
  );
}
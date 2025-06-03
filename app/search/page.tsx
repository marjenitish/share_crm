'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, LayoutGrid, CalendarDays } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';
import { ClassSearch } from '@/components/shared/class-search';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EnrollmentSteps } from '@/components/enrollment/enrollment-steps';
import { EnrollmentComplete } from '@/components/enrollment/enrollment-complete';
import { SearchCalendarView } from '@/components/search/search-calendar-view';
import { createBrowserClient } from '@/lib/supabase/client';

interface SearchResults {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  instructor_name: string;
  exercise_type: string;
  fee_amount: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [isEnrollmentComplete, setIsEnrollmentComplete] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<'trial' | 'direct'>('direct');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchResults = async () => {
      const location = searchParams.get('location');
      const exerciseTypeId = searchParams.get('exerciseTypeId');
      const date = searchParams.get('date');

      let query = supabase
        .from('classes')
        .select(`
          *,
          exercise_types (name),
          instructors (name)
        `);

      if (location) {
        query = query.or(`venue.ilike.%${location}%,zip_code.ilike.%${location}%`);
      }

      if (exerciseTypeId && exerciseTypeId !== 'all') {
        query = query.eq('exercise_type_id', exerciseTypeId);
      }

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching classes:', error);
        return;
      }

      const formattedResults = data?.map(cls => ({
        id: cls.id,
        name: cls.name,
        venue: cls.venue,
        date: cls.date,
        time: cls.time,
        instructor_name: cls.instructors?.name,
        exercise_type: cls.exercise_types?.name,
        fee_amount: cls.fee_amount
      })) || [];

      setSearchResults(formattedResults);
      setLoading(false);
    };

    fetchResults();
  }, [searchParams]);

  const handleEnroll = (classData: any) => {
    setSelectedClass(classData);
    setIsEnrollmentOpen(true);
  };

  const handleEnrollmentComplete = () => {
    setIsEnrollmentOpen(false);
    setIsEnrollmentComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ClassSearch />
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Search Results</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((cls) => (
                    <div key={cls.id} className="rounded-xl border bg-card overflow-hidden">
                      <div className="aspect-video relative bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          {cls.exercise_type}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {cls.exercise_type}
                        </p>
                        <div className="space-y-2 text-sm text-muted-foreground mb-6">
                          <p>📍 {cls.venue}</p>
                          <p>📅 {format(parseISO(cls.date), 'dd/MM/yyyy')}</p>
                          <p>⏰ {cls.time}</p>
                          <p>👤 {cls.instructor_name}</p>
                          <p>💰 ${cls.fee_amount.toFixed(2)}</p>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleEnroll(cls)}
                        >
                          Enroll
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <SearchCalendarView 
                  classes={searchResults}
                  onClassSelect={handleEnroll}
                />
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Classes Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria to find more classes.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollmentOpen} onOpenChange={setIsEnrollmentOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>Class Enrollment</DialogTitle>
          <EnrollmentSteps
            classData={selectedClass}
            onComplete={handleEnrollmentComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Enrollment Complete Dialog */}
      <Dialog open={isEnrollmentComplete} onOpenChange={setIsEnrollmentComplete}>
        <DialogContent className="max-w-md">
          <DialogTitle>Enrollment Complete</DialogTitle>
          <EnrollmentComplete
            classData={selectedClass}
            enrollmentType={enrollmentType}
            onClose={() => setIsEnrollmentComplete(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
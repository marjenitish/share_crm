import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EnrollmentCompleteProps {
  classData: any;
  enrollmentType: 'trial' | 'direct';
  onClose: () => void;
}

export function EnrollmentComplete({ classData, enrollmentType, onClose }: EnrollmentCompleteProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {enrollmentType === 'trial' 
          ? 'Trial Class Booked Successfully!'
          : 'Enrollment Complete!'}
      </h2>

      <p className="text-muted-foreground mb-6">
        {enrollmentType === 'trial'
          ? 'Your trial class has been booked. We look forward to meeting you!'
          : 'Welcome to the class! We\'re excited to have you join us.'}
      </p>

      <div className="bg-muted/30 rounded-lg p-6 mb-6 text-left">
        <h3 className="font-semibold mb-2">Class Details</h3>
        <div className="space-y-2 text-muted-foreground">
          <p>Class: {classData.name}</p>
          <p>Date: {new Date(classData.date).toLocaleDateString()}</p>
          <p>Time: {classData.time}</p>
          <p>Location: {classData.venue}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentForm } from './enrollment-form';
import { PAQForm } from './paq-form';
import { BiAnnualSurvey } from './bi-annual-survey';
import { PaymentForm } from './payment-form';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface EnrollmentStepsProps {
  classData: any;
  onComplete: () => void;
}

export function EnrollmentSteps({ classData, onComplete }: EnrollmentStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [enrollmentType, setEnrollmentType] = useState<'trial' | 'direct'>('direct');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Choose Type' },
    { id: 2, title: 'Details' },
    { id: 3, title: 'PAQ Form' },
    { id: 4, title: 'Survey' },
    { id: 5, title: 'Payment' },
  ];

  const handleEnrollmentTypeSelect = (type: 'trial' | 'direct') => {
    setEnrollmentType(type);
    setCurrentStep(2);
  };

  const handleEnrollmentFormSubmit = (data: any) => {
    setEnrollmentData(data);
    setCurrentStep(3);
  };

  const handlePAQSubmit = () => {
    setCurrentStep(4);
  };

  const handleSurveySubmit = () => {
    if (enrollmentType === 'direct') {
      setCurrentStep(5);
    } else {
      onComplete();
    }
  };

  const handlePaymentComplete = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center ${
              step.id === currentStep
                ? 'text-primary'
                : step.id < currentStep
                ? 'text-primary/50'
                : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full border text-xs">
              {step.id < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span className="ml-2 hidden sm:inline text-xs">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-4">
        {currentStep > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Choose Your Enrollment Type</h2>
            <Tabs defaultValue="direct" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct" onClick={() => handleEnrollmentTypeSelect('direct')}>
                  Direct Enrollment
                </TabsTrigger>
                <TabsTrigger value="trial" onClick={() => handleEnrollmentTypeSelect('trial')}>
                  Trial Class
                </TabsTrigger>
              </TabsList>
              <TabsContent value="direct">
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold">Direct Enrollment</h3>
                  <p className="text-sm text-muted-foreground">
                    Enroll directly in the class and enjoy full access to all sessions.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Full term access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Regular class schedule</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Progress tracking</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="trial">
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold">Trial Class</h3>
                  <p className="text-sm text-muted-foreground">
                    Try a single class to see if it's right for you.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>One-time class</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>No commitment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="text-primary h-4 w-4" />
                      <span>Meet the instructor</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStep === 2 && (
          <EnrollmentForm
            classData={classData}
            enrollmentType={enrollmentType}
            onSubmit={handleEnrollmentFormSubmit}
          />
        )}

        {currentStep === 3 && (
          <PAQForm onSubmit={handlePAQSubmit} />
        )}

        {currentStep === 4 && (
          <BiAnnualSurvey onSubmit={handleSurveySubmit} />
        )}

        {currentStep === 5 && enrollmentType === 'direct' && (
          <PaymentForm
            classData={classData}
            enrollmentData={enrollmentData}
            onComplete={handlePaymentComplete}
          />
        )}
      </Card>
    </div>
  );
}
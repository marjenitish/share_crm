'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  classData: any;
  enrollmentData: any;
  onComplete: () => void;
}

function CheckoutForm({ classData, enrollmentData, onComplete }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(classData.fee_amount * 100),
          currency: 'aud',
          metadata: {
            classId: classData.id,
            customerEmail: enrollmentData.email,
            customerName: `${enrollmentData.firstName} ${enrollmentData.lastName}`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const { clientSecret } = await response.json();

      const { error: submitError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/enrollment/confirmation`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        throw submitError;
      }

      toast({
        title: 'Payment successful',
        description: 'Your enrollment is complete!',
      });
      onComplete();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Payment failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

interface PaymentFormProps {
  classData: any;
  enrollmentData: any;
  onComplete: () => void;
}

export function PaymentForm({ classData, enrollmentData, onComplete }: PaymentFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment</h2>
        <p className="text-muted-foreground">
          Complete your enrollment by making the payment.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{classData.name}</h3>
              <p className="text-sm text-muted-foreground">{classData.description}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${classData.fee_amount}</p>
              <p className="text-sm text-muted-foreground">{classData.fee_criteria}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <Elements 
              stripe={stripePromise} 
              options={{
                mode: 'payment',
                amount: Math.round(classData.fee_amount * 100),
                currency: 'aud',
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0066cc',
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                  },
                },
              }}
            >
              <CheckoutForm 
                classData={classData}
                enrollmentData={enrollmentData}
                onComplete={onComplete} 
              />
            </Elements>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
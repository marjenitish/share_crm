import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.created':
        // Log the creation of a new payment intent
        console.log('Payment intent created:', event.data.object.id);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update enrollment status in database
        const { error: successError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'paid',
            payment_intent: paymentIntent.id,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent', paymentIntent.id);

        if (successError) throw successError;
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update enrollment status to failed
        const { error: failureError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent', failedPayment.id);

        if (failureError) throw failureError;
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update enrollment status to cancelled
        const { error: cancelError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'cancelled',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent', canceledPayment.id);

        if (cancelError) throw cancelError;
        break;

      case 'payment_intent.requires_action':
        // Handle additional authentication required
        const actionRequired = event.data.object as Stripe.PaymentIntent;
        console.log('Additional authentication required for:', actionRequired.id);
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Refund;
        
        // Update enrollment status to refunded
        const { error: refundError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'refunded',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent', refund.payment_intent);

        if (refundError) throw refundError;
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        
        // Mark the enrollment as disputed
        const { error: disputeError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'disputed',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent', dispute.payment_intent);

        if (disputeError) throw disputeError;
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
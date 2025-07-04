import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { SubscriptionService } from '@/services/subscription';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);
  
  const orderNo = session.metadata?.order_no;
  const userUuid = session.metadata?.user_uuid;
  const productId = session.metadata?.product_id;
  const productName = session.metadata?.product_name;
  const credits = parseInt(session.metadata?.credits || '0');

  if (!orderNo || !userUuid || !productId) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  try {
    // Update order status
    await db()
      .update(orders)
      .set({
        status: 'paid',
        paid_at: new Date(),
        paid_email: session.customer_email || '',
        stripe_session_id: session.id,
        sub_id: session.subscription as string || '',
        paid_detail: JSON.stringify(session)
      })
      .where(eq(orders.order_no, orderNo));

    // Create subscription for user
    if (productId !== 'free') {
      await SubscriptionService.createPaidSubscription(
        userUuid,
        productId,
        productName || `ClientSeeker ${productId}`,
        credits,
        session.subscription as string
      );
    }

    console.log(`Order ${orderNo} processed successfully`);
  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  try {
    // For recurring subscriptions, renew the user's quota
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userUuid = subscription.metadata?.user_uuid;
    
    if (userUuid) {
      await SubscriptionService.renewSubscription(userUuid);
      console.log(`Subscription renewed for user ${userUuid}`);
    }
  } catch (error) {
    console.error('Error processing invoice payment:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const userUuid = subscription.metadata?.user_uuid;
  
  if (!userUuid) {
    return;
  }

  try {
    // Handle subscription changes (plan upgrades, downgrades, etc.)
    if (subscription.status === 'active') {
      // Subscription is active, ensure user has access
      console.log(`Subscription ${subscription.id} is active for user ${userUuid}`);
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      // Subscription canceled or unpaid, may need to revoke access
      console.log(`Subscription ${subscription.id} is ${subscription.status} for user ${userUuid}`);
    }
  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const userUuid = subscription.metadata?.user_uuid;
  
  if (!userUuid) {
    return;
  }

  try {
    // Handle subscription cancellation
    // You might want to mark the user's subscription as inactive
    console.log(`Subscription ${subscription.id} deleted for user ${userUuid}`);
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  try {
    // Handle failed payment
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userUuid = subscription.metadata?.user_uuid;
    
    if (userUuid) {
      console.log(`Payment failed for user ${userUuid}, subscription ${subscriptionId}`);
      // You might want to send an email notification or temporarily suspend access
    }
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}
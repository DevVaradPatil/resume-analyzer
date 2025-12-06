import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { syncClerkUserToSupabase, deleteUserByClerkId } from '../../../../lib/user-sync';

export async function POST(req) {
  // Get the Svix headers for webhook verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Get the event type and data
  const eventType = evt.type;
  const eventData = evt.data;

  console.log(`Received Clerk webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        // Create user in Supabase
        console.log('Creating user in Supabase:', eventData.id);
        await syncClerkUserToSupabase(eventData);
        console.log('User created successfully');
        break;

      case 'user.updated':
        // Update user in Supabase
        console.log('Updating user in Supabase:', eventData.id);
        await syncClerkUserToSupabase(eventData);
        console.log('User updated successfully');
        break;

      case 'user.deleted':
        // Delete user from Supabase
        console.log('Deleting user from Supabase:', eventData.id);
        await deleteUserByClerkId(eventData.id);
        console.log('User deleted successfully');
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing ${eventType}:`, error);
    return NextResponse.json(
      { error: `Error processing ${eventType}: ${error.message}` },
      { status: 500 }
    );
  }
}

// Clerk webhooks only use POST
export async function GET() {
  return NextResponse.json(
    { message: 'Clerk webhook endpoint. Use POST method.' },
    { status: 405 }
  );
}

import { query } from '/opt/nodejs/db.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;

async function updateSubscription(cognitoSub, tier, source, plan, rawEvent) {
  const expiresAt = tier === 'pro'
    ? new Date(Date.now() + (plan === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { rows } = await query(
    `UPDATE users SET subscription_tier = $1, subscription_source = $2,
     subscription_expires_at = $3, updated_at = now()
     WHERE cognito_sub = $4 RETURNING id`,
    [tier, source, expiresAt, cognitoSub]
  );

  if (rows.length) {
    await query(
      `INSERT INTO subscription_events (user_id, event_type, source, plan, raw_event)
       VALUES ($1, $2, $3, $4, $5)`,
      [rows[0].id, tier === 'pro' ? 'purchase' : 'cancel', source, plan, JSON.stringify(rawEvent)]
    );
  }

  return rows.length > 0;
}

async function handleStripeWebhook(event) {
  // In production, validate Stripe-Signature header
  // For now, just parse the event body
  const body = JSON.parse(event.body);
  const type = body.type;

  if (type === 'checkout.session.completed') {
    const session = body.data?.object;
    const cognitoSub = session?.metadata?.cognito_sub;
    const plan = session?.metadata?.plan || 'monthly';
    if (cognitoSub) {
      await updateSubscription(cognitoSub, 'pro', 'stripe', plan, body);
    }
  }

  if (type === 'invoice.paid') {
    const invoice = body.data?.object;
    const customerId = invoice?.customer;
    if (customerId) {
      const { rows } = await query(
        'SELECT cognito_sub FROM users WHERE stripe_customer_id = $1',
        [customerId]
      );
      if (rows.length) {
        await updateSubscription(rows[0].cognito_sub, 'pro', 'stripe', 'renewal', body);
      }
    }
  }

  if (type === 'customer.subscription.deleted') {
    const sub = body.data?.object;
    const customerId = sub?.customer;
    if (customerId) {
      const { rows } = await query(
        'SELECT cognito_sub FROM users WHERE stripe_customer_id = $1',
        [customerId]
      );
      if (rows.length) {
        await updateSubscription(rows[0].cognito_sub, 'free', 'stripe', null, body);
      }
    }
  }

  return ok({ received: true });
}

async function handleRevenueCatWebhook(event) {
  // Validate authorization header
  if (REVENUECAT_WEBHOOK_SECRET) {
    const authHeader = event.headers?.['Authorization'] || event.headers?.['authorization'];
    if (authHeader !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
      return badRequest('Invalid webhook authorization');
    }
  }

  const body = JSON.parse(event.body);
  const eventType = body.event?.type;
  const appUserId = body.event?.app_user_id; // This is cognito_sub

  if (!appUserId) return ok({ received: true, skipped: 'no app_user_id' });

  const purchaseEvents = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION'];
  const cancelEvents = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];

  if (purchaseEvents.includes(eventType)) {
    await updateSubscription(appUserId, 'pro', 'revenuecat', 'iap', body);
  } else if (cancelEvents.includes(eventType)) {
    await updateSubscription(appUserId, 'free', 'revenuecat', null, body);
  }

  return ok({ received: true });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});

    const path = event.path;

    if (path.endsWith('/stripe') && event.httpMethod === 'POST') {
      return await handleStripeWebhook(event);
    }

    if (path.endsWith('/revenuecat') && event.httpMethod === 'POST') {
      return await handleRevenueCatWebhook(event);
    }

    return badRequest('Unknown webhook endpoint');
  } catch (err) {
    return serverError(err);
  }
}

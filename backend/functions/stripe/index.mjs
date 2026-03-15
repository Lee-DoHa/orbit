import { query } from '/opt/nodejs/db.mjs';
import { getUserSub } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const USE_MOCK = !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === '';

// Stripe price IDs (configure in Stripe Dashboard)
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_orbit_monthly',
  annual: process.env.STRIPE_PRICE_ANNUAL || 'price_orbit_annual',
};

async function stripeRequest(path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function getOrCreateStripeCustomer(sub, email) {
  const { rows } = await query(
    'SELECT id, stripe_customer_id, email FROM users WHERE cognito_sub = $1',
    [sub]
  );
  if (!rows.length) throw new Error('User not found');

  const user = rows[0];
  if (user.stripe_customer_id) return user.stripe_customer_id;

  if (USE_MOCK) return 'cus_mock_' + sub.slice(0, 8);

  // Create Stripe customer
  const customer = await stripeRequest('/customers', {
    email: user.email,
    'metadata[cognito_sub]': sub,
    'metadata[user_id]': user.id,
  });

  await query(
    'UPDATE users SET stripe_customer_id = $1 WHERE cognito_sub = $2',
    [customer.id, sub]
  );

  return customer.id;
}

async function createCheckoutSession(event, sub) {
  const body = JSON.parse(event.body);
  const plan = body.plan;
  if (!plan || !['monthly', 'annual'].includes(plan)) {
    return badRequest('plan must be "monthly" or "annual"');
  }

  const { rows } = await query('SELECT email FROM users WHERE cognito_sub = $1', [sub]);
  const email = rows[0]?.email;

  if (USE_MOCK) {
    // Mock: return a fake checkout URL that redirects to success
    const successUrl = body.successUrl || 'http://localhost:8081/subscription?success=1';
    return ok({ url: successUrl, mock: true });
  }

  const customerId = await getOrCreateStripeCustomer(sub, email);

  const session = await stripeRequest('/checkout/sessions', {
    'customer': customerId,
    'mode': 'subscription',
    'line_items[0][price]': PRICE_IDS[plan],
    'line_items[0][quantity]': '1',
    'success_url': body.successUrl || 'http://localhost:8081/subscription?success=1',
    'cancel_url': body.cancelUrl || 'http://localhost:8081/subscription?cancel=1',
    'metadata[cognito_sub]': sub,
    'metadata[plan]': plan,
  });

  return ok({ url: session.url });
}

async function createPortalSession(event, sub) {
  const customerId = await getOrCreateStripeCustomer(sub);

  if (USE_MOCK) {
    return ok({ url: 'http://localhost:8081/subscription', mock: true });
  }

  const session = await stripeRequest('/billing_portal/sessions', {
    'customer': customerId,
    'return_url': 'http://localhost:8081/settings',
  });

  return ok({ url: session.url });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});

    const path = event.path;
    const sub = getUserSub(event);

    if (path.endsWith('/checkout-session') && event.httpMethod === 'POST') {
      return await createCheckoutSession(event, sub);
    }

    if (path.endsWith('/portal-session') && event.httpMethod === 'GET') {
      return await createPortalSession(event, sub);
    }

    return badRequest('Unknown stripe endpoint');
  } catch (err) {
    return serverError(err);
  }
}

// app/routes/newsletter.tsx
import type {ActionFunctionArgs} from 'react-router';
import {hydrogenContext} from '@shopify/hydrogen';

function generateRandomPassword() {
  // Simple example; use something stronger in production
  return Math.random().toString(36).slice(-12) + 'A1!';
}

export async function action({request, context}: ActionFunctionArgs) {
  const storefront = context.get(hydrogenContext.storefront);

  const formData = await request.formData();
  const rawEmail = formData.get('email');
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';

  if (!email) return {ok: false, error: 'Email is required'};

  const password = generateRandomPassword();

  const mutation = `#graphql
    mutation NewsletterSubscribe($email: String!, $password: String!) {
      customerCreate(input: {
        email: $email
        password: $password
        acceptsMarketing: true
      }) {
        customer { id email acceptsMarketing }
        userErrors { field message }
      }
    }
  `;

  const result = await storefront.mutate(mutation, {
    variables: {email, password},
    storefrontApiVersion: '2025-07',
  });

  const customerCreate = (result as any)?.customerCreate;

  // If there's a top-level GraphQL error (like the password error),
  // customerCreate will be undefined and the error will be in result.errors
  if (!customerCreate) {
    const errors = (result as any)?.errors;
    if (errors?.length) {
      console.error('GraphQL errors:', errors);
      return {ok: false, error: errors[0].message};
    }
    return {ok: false, error: 'Unexpected response from Shopify API'};
  }

  const errors = customerCreate.userErrors;
  if (errors?.length) {
    console.error('customerCreate userErrors:', errors);
    return {ok: false, error: errors[0].message};
  }

  return {ok: true};
}

export default function NewsletterRoute() {
  return null;
};
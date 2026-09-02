// app/routes/newsletter.tsx
import type {ActionFunctionArgs} from 'react-router';
import {hydrogenContext} from '@shopify/hydrogen';

export async function action({request, context}: ActionFunctionArgs) {
  const storefront = context.get(hydrogenContext.storefront);

  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();

  if (!email) return {ok: false, error: 'Email is required'};

  const mutation = `#graphql
    mutation NewsletterSubscribe($email: String!) {
      customerCreate(input: { email: $email, acceptsMarketing: true }) {
        customer { id }
        userErrors { field message }
      }
    }
  `;

  const {customerCreate} = await storefront.mutate(mutation, {
    variables: {email},
    storefrontApiVersion: '2025-07',
  });

  const errors = customerCreate?.userErrors;
  if (errors?.length) return {ok: false, error: errors[0].message};

  return {ok: true};
}

// no UI needed; this route is just an action target
export default function NewsletterRoute() {
  return null;
}
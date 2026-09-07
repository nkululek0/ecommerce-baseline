import type {ActionFunctionArgs} from 'react-router';
import {useFetcher} from 'react-router';
import {hydrogenContext} from '@shopify/hydrogen';

// --- Action: toggle marketing for the logged-in customer ---
export async function action({request, context}: ActionFunctionArgs) {
  const storefront = context.get(hydrogenContext.storefront);
  const customerAccount = context.get(hydrogenContext.customerAccount);

  // This checks & refreshes the Customer Account access token stored by Hydrogen
  const customerAccessToken = await customerAccount.getAccessToken();

  if (!customerAccessToken) {
    return {ok: false, error: 'You need to be logged in to manage email preferences.'};
  }

  const formData = await request.formData();
  const subscribe = formData.get('subscribe') === 'on';

  const mutation = `#graphql
    mutation CustomerMarketingUpdate(
      $customerAccessToken: String!
      $acceptsMarketing: Boolean!
    ) {
      customerUpdate(
        customerAccessToken: $customerAccessToken
        customer: { acceptsMarketing: $acceptsMarketing }
      ) {
        customer {
          id
          email
          acceptsMarketing
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const result = await storefront.mutate(mutation, {
    variables: {
      customerAccessToken,
      acceptsMarketing: true,
    },
    storefrontApiVersion: '2025-07',
  });

  console.log('RAW MUTATION RESULT:', JSON.stringify(result, null, 2));

  const {customerUpdate} = result as any;

  if (!customerUpdate) {
    const errors = (result as any)?.errors;
    if (errors?.length) {
      return {ok: false, error: errors[0].message};
    }
    return {ok: false, error: 'Unexpected response from Shopify API.'};
  }

  const userErrors = customerUpdate.customerUserErrors;
  if (userErrors?.length) {
    return {ok: false, error: userErrors[0].message};
  }

  return {
    ok: true,
    acceptsMarketing: customerUpdate.customer.acceptsMarketing as boolean,
  };
}

// Optional: this route is mainly used as an action target
export default function AccountNewsletterRoute() {
  return null;
}
import { createStorefrontClient } from '@shopify/hydrogen-react';

export const client = createStorefrontClient({
  // load environment variables according to your framework and runtime
  storeDomain: import.meta.env.VITE_PUBLIC_STORE_DOMAIN,
  publicStorefrontToken: import.meta.env.VITE_PUBLIC_STOREFRONT_API_TOKEN,
});

// a Storefront API query
const GRAPHQL_QUERY = `
  query {
    shop {
      name
    }
  }
`;

// make the request
export async function getServerSideProps(query: string = GRAPHQL_QUERY) {
  // Get the Storefront API url
  const response = await fetch(client.getStorefrontApiUrl(), {
    body: JSON.stringify({
      query: query,
    }),
    // Generate the headers using the private token. Additionally, you can pass in the buyer's IP address from the request object to help prevent bad actors from overloading your store.
    // headers: client.getPrivateTokenHeaders({ buyerIp: '...' }),
    headers: client.getPublicTokenHeaders({}),
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  return { props: json };
};
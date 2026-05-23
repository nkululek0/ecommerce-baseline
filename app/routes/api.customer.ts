import { type LoaderFunctionArgs } from 'react-router';
import { hydrogenContext } from '@shopify/hydrogen';
import { CUSTOMER_DETAILS_QUERY } from '~/graphql/customer-account/CustomerDetailsQuery';

export async function loader({context, request}: LoaderFunctionArgs) {
  // Get the pre-configured customerAccount client
  const customerAccount = context.get(hydrogenContext.customerAccount);

  // This will validate/refresh tokens as needed
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      customer: null,
      status: 401,
    };
  }

  // If logged in, query Customer Account API for details
  // Use whatever fields you need that are supported by your API version
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors && errors.length) {
    // You can log errors on the server if needed
    console.error('CustomerAccount API errors', errors);
  }

  const customer = data?.customer ?? null;

  return {
    isLoggedIn: Boolean(customer),
    customer,
    status: 200,
  };
}
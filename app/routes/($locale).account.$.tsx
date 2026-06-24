import {redirect} from 'react-router';
import type {Route} from './+types/($locale).account.$';

// fallback wild card for all unauthenticated routes in account section
export async function loader({context}: Route.LoaderArgs) {
  const { env } = context;
  context.customerAccount.handleAuthStatus();

  // return redirect('/account');
  return redirect(`https://shopify.com/${ env.SHOP_ID }/account/profile`);
}

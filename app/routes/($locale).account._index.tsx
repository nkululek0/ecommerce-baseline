import {redirect} from 'react-router';
import type {Route} from './+types/_index';

export async function loader({context}: Route.LoaderArgs) {
  const { env } = context;

  // return redirect('/account/orders');
  return redirect(`https://shopify.com/${ env.SHOP_ID }/account/profile`);
}

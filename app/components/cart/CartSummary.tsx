import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';

import { CartDiscounts } from './CartDiscounts';
import { CartGiftCards } from './CartGiftCards';
import { CreditCard, Gift } from 'lucide-react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <>
    <div className="bg-white px-6 py-8">
      {/* Subtotal */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-source text-gray-600">
          Subtotal:
        </span>
        <span className="font-source font-medium">
          {
            cart.cost?.subtotalAmount?.amount ? (
              <Money data={ cart.cost.subtotalAmount } />
            )
            : (
              '-'
            )
          }
        </span>
      </div>

      {/* Discounts */}
      <CartDiscounts discountCodes={ cart.discountCodes }/>

      {/* Gift Cards */}
      <CartGiftCards giftCardCodes={ cart.appliedGiftCards } />

      {/* Extra Information */}
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Gift className='w-4 h-4' />
          <span>Complimentary gift wrapping available</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className='w-4 h-4' />
          <span>Secure checkout</span>
        </div>
      </div>

      {/* Checkout Button */}
      <CartCheckoutActions checkoutUrl={ cart.checkoutUrl } />
    </div>
    </>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className='leading-[0] mt-6'>
      <a
        href={checkoutUrl}
        target="_self"
        className='block py-6 px-4 text-center cursor-pointer text-white font-source tracking-wider transition-all duration-300 ease-in-out bg-brand-navy hover:bg-brand-navyLight'
      >
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

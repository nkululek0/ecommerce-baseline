import type { CartApiQueryFragment } from 'storefrontapi.generated';
import { CartForm } from '@shopify/hydrogen';
import React, { useState, useRef } from 'react';
import { Loader2, Ticket } from 'lucide-react';
import type { FetcherWithComponents } from 'react-router';

export function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <>
    <div className="py-4 border-t border-gray-100">
      {/* Applied Discounts */}
      {
        codes.length > 0 && ( <></> )
      }

      {/* Discount Input */}
      {
        showInput ? (
          <UpdateDiscountForm discountCodes={ codes }>
            {
              (fetcher) => {
                const isLoading = fetcher.state !=='idle';

                return (
                  <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={ inputRef }
                        type="text"
                        name="discountCode"
                        placeholder="Enter promo code"
                        className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-brand-navy font-source text-sm"
                        disabled={ isLoading }
                      />
                      {
                        isLoading && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 className='w-4 h-4 animate-spin text-gray-400'/>
                          </div>
                        )
                      }
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-brand-navy text-white rounded text-sm font-source transition-colors duration-300 ${ isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-navyLight' }`}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={ () => setShowInput(false) }
                        className="px-4 py-2 border border-gray-200 rounded text-sm font-source hover:border-gray-300 transition-colors duration-300"
                        disabled={ isLoading }
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  </>
                );
              }
            }
          </UpdateDiscountForm>
        )
        : (
          <button
            onClick={ () => setShowInput(true) }
            className="text-sm text-brand-gold hover:text-brand-goldDark font-source transition-colors inline-flex items-center gap-2"
          >
            <Ticket className='w-4 h-4' />
            Add Promo Code
          </button>
        )
      }
    </div>
    </>
  );
};

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode | ((fetcher: FetcherWithComponents<any>) => React.ReactNode);
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}
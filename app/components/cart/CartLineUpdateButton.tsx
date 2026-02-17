import { CartForm } from '@shopify/hydrogen';
import type { CartLineUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

type CartLineUpdateButtonProps = {
  lines: CartLineUpdateInput[]
  children: React.ReactNode
};

export function CartLineUpdateButton (props: CartLineUpdateButtonProps) {
  const { lines, children } = props;
  const [updating, setUpdating] = useState(false);

  return (
    <>
    <CartForm
      route='/cart'
      action={ CartForm.ACTIONS.LinesUpdate }
      inputs={{ lines }}
    >
      {
        (fetcher) => {
          useEffect(() => {
            if (fetcher.state === 'loading') {
              setUpdating(true);
            }
            else if (fetcher.state === 'idle') {
              setTimeout(() => { return setUpdating(false) }, 200)
            }
          }, [fetcher.state]);

          if (updating) {
            return (
              <div className="relative inline-flex items-center justify-center">
                <div className="opacity-50 pointer-events-none">
                  { children }
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className='w-4 h-4 animate-spin text-brand-gold' />
                </div>
              </div>
            );
          }

          return children;
        }
      }
    </CartForm>
    </>
  );
};
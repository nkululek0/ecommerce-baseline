import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/cart/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from '../ProductPrice';
import {useAside} from '../Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';
import { CartLineQuantityAdjuster } from './CartLineQuantityAdjuster';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-100">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          alt={ title }
          aspectRatio='1/1'
          data={ image! }
          className='object-cover w-full h-full'
          loading='lazy'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={ lineItemUrl }
          prefetch='intent'
          onClick={ close }
          className='block'
        >
          <h3 className="font-playFair text-base text-brand-navy mb-1 truncate">
            { product.title }
          </h3>
        </Link>

        {/* Product Options */}
        <div className="mt-1 space-y-1">
          {
            selectedOptions.map((option) => {
              return (
                <p
                  key={`${ product.id }-${ option.name }`}
                  className="font-source text-sm text-gray-500"
                >
                  { option.name }: { option.value }
                </p>
              )
            })
          }
        </div>

        {/* Price & Quantity Controls */}
        <div className="mt-4 flex items-center justify-between">
          <CartLineQuantityAdjuster line={ line } />
          <div className="font-source font-medium">
            <ProductPrice price={ line?.cost?.totalAmount } />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

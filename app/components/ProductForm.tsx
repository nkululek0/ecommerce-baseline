import {Link} from 'react-router';
import { type MappedProductOptions } from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  product,
  selectedVariant,
  className,
}: {
  product: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  className?: string;
}) {
  const {open} = useAside();

  return (
    <>
    <div className={`flex flex-col ${ className }`}>
      <div className="space-y-4">
        {/* Variant Options */}
        <div className="mb-2">
          {
            product.map((option) => (
              <ProductOptions option={ option } />
            ))
          }
        </div>

        {/* Add to Cart Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-source text-brand-navy/60">
              { selectedVariant?.availableForSale ? 'Ready to ship' : 'Currently unavailable' }
            </div>
            {
              selectedVariant?.sku && (
                <div className="text-sm font-source text-brand-navy/60">
                  SKU: { selectedVariant.sku }
                </div>
              )
            }
          </div>
          <AddToCartButton
            disabled={ !selectedVariant || !selectedVariant.availableForSale }
            afterAddedToCart={() => { open('cart') }}
            lines={
              selectedVariant
              ? [{
                merchandiseId: selectedVariant.id,
                quantity: 1,
                selectedVariant: selectedVariant
              }]
              : []
            }
          >
            { selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold out' }
          </AddToCartButton>
        </div>
      </div>
    </div>
    </>
  );
};

function ProductOptions({ option }: { option: MappedProductOptions }) {
  return (
    <div className="product-options" key={ option.name }>
      <h5 className='font-semibold'>{ option.name }:</h5>
      <div className="product-options-grid">
        {option.optionValues.map(({name, available, selected, variantUriQuery}) => {
          return (
            <Link
              key={ option.name + name }
              prefetch="intent"
              preventScrollReset
              replace
              to={`?${ variantUriQuery }`}
              className={`product-options-item border border-solid rounded-md ${ selected ? 'border-brand-gold text-brand-gold text-semibold' : 'border-transparent' }`}
              style={{
                opacity: available ? 1 : 0.3,
              }}
            >
              { name }
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
};
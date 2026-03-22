import { useRef } from 'react';
import { ProductProvider, useProduct } from '@shopify/hydrogen-react';
import type { Product, MoneyV2 } from '@shopify/hydrogen-react/storefront-api-types';
import { ProductPrice } from './ProductPrice';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';

type ProductProps = {
  product: any
  variants?: any
  hideAdditionalInfo?: boolean
  isFullPage?: boolean
};

export function Product (props: ProductProps) {
  const { product } = props;

  return (
    <Provider
      product={ product }
    >
    </Provider>
  );
};

const Provider = ({product}: {product: Product}) => {
  return (
    <ProductProvider data={product} initialVariantId="">
      <UsingProduct />
    </ProductProvider>
  );
};

type ProductOption = {
    name?: string | undefined;
    values?: (string | undefined)[] | undefined;
} | undefined

const UsingProduct = () => {
  const { product, options, variants, selectedVariant, setSelectedVariant } = useProduct();

  if (!product) return null;

  if (!selectedVariant) {
    const variant = variants?.filter((value) => {
      if (value) {
        return value.title == product?.selectedOrFirstAvailableVariant?.title;
      }
    })[0];

    if (variant) setSelectedVariant(variant);
  }

  if (!selectedVariant || !selectedVariant.selectedOptions) return null;

  const selectedVariantOptionsKeys = useRef<{ [key: string]: string }>({});

  for (const value of selectedVariant.selectedOptions) {
    if (value?.name && value.value) {
      selectedVariantOptionsKeys.current[value.name] = value.value;
    }
  }

  return (
    <>
    <div className='pb-8 pt-5'>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left side Images */}
          <div className="space-y-8">
            {
              product.images?.nodes && (
                <ProductImage
                  images={ product.images?.nodes?.map(node => ({
                    id: node?.id,
                    url: node?.url,
                    altText: node?.altText,
                    width: node?.width,
                    height: node?.height
                  }))}
                />
              )
            }
          </div>

          {/* Right side - Details & CTA */}
          <div className="space-y-10">
            {/* Product Title & Price */}
            <div className="space-y-4 border-b border-brand-navy/10 pb-4">
              <h1 className="font-playFair text-3xl lg:text-4xl text-brand-navy">
                { product.title }
              </h1>
              <ProductPrice
                price={ selectedVariant?.price as MoneyV2 }
                compareAtPrice={ selectedVariant?.compareAtPrice as MoneyV2 | null }
                className='font-source text-xl text-brand-navy'
              />
            </div>
            <div className={`flex flex-col`}>
              <div className="space-y-4">
                {/* Variant Options */}
                <div className="mb-2">
                  {
                    options?.map((option) => (
                      <ProductOptions
                        option={ option }
                        selectedVariant={ selectedVariantOptionsKeys.current[option?.name || ""] }
                        setSelectedVariant={(key: string, value: string) => {
                          selectedVariantOptionsKeys.current[key] = value;

                          const variantTitle = Object.values(selectedVariantOptionsKeys.current).join(" / ");
                          const variant = variants?.filter((value) => value?.title == variantTitle)[0];

                          if (variant) setSelectedVariant(variant);
                        }}
                      />
                    ))
                  }
                </div>

                {/* Add to Cart Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-source text-brand-navy/60">
                      { selectedVariant.availableForSale ? 'Ready to ship' : 'Currently unavailable' }
                    </div>
                    {
                      selectedVariant?.sku && (
                        <div className="text-sm font-source text-brand-navy/60">
                          SKU: { selectedVariant.sku }
                        </div>
                      )
                    }
                  </div>
                  <ProductAddToCartButton product={ selectedVariant } />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

type ProductOptionsProps = {
  option: ProductOption
  selectedVariant: string
  setSelectedVariant: (key: string, value: string) => void
};

const ProductOptions = (props: ProductOptionsProps) => {
  const { option, selectedVariant, setSelectedVariant } = props;

  if (option && option.name && option.values) {
    const { name, values } = option;

    return (
      <>
      {
        option && (
          <div className="product-options" key={ name }>
            <h5 className='font-semibold'>{ name }:</h5>
            <div className="product-options-grid">
              {
                values.map((value) => {
                  if (value) {
                    const selected = value == selectedVariant;

                    return (
                      <p
                        key={ name + value }
                        className={`product-options-item border border-solid rounded-md cursor-pointer ${ selected ? 'border-brand-gold text-brand-gold text-semibold' : 'border-transparent' }`}
                        style={{
                          opacity: true ? 1 : 0.3,
                        }}
                        onClick={() => { setSelectedVariant(name, value); }}
                      >
                        { value }
                      </p>
                    );
                  }
                })
              }
            </div>
            <br />
          </div>
        )
      }
      </>
    );
  }

  return null;
};

const ProductAddToCartButton = ({ product }: { product: any }) => {
  const selectedVariant = product;

  if (!selectedVariant) {
    return null;
  }

  return (
    <>
    <AddToCartButton
      disabled={ !selectedVariant || !selectedVariant.availableForSale }
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
    </>
  );
};
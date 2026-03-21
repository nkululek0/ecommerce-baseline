import { useState } from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import { ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { Product } from './Product';
import { getServerSideProps } from '~/../client';

export function ProductItem({
  product,
  loading,
  hidePrice,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  hidePrice?: boolean
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [openModal, setOpenModal] = useState(false);
  const [modalDetails, setModalDetails] = useState<{ product: any }>({ product: null });

  return (
    <>
    <Link
      className="group block relative"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {/* Image Container with hover effects */}
      <div className="relative aspect-square overflow-hidden bg-brand-cream mb-6">
        {
          image && (
            <>
              <Image
                alt={image.altText || product.title}
                data={image}
                loading={loading}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors duration-500" />

              {/* Quick view button */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                onClick={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpenModal(true);

                  const productVariantCountProps = await getServerSideProps(getProductVariantQueryString(product.handle)) as any;

                  if (!productVariantCountProps.props.data) {
                    console.error("Failed to fetch product variant count, please retry");

                    return null;
                  }

                  const variantCount = productVariantCountProps.props.data.product.variantsCount.count;

                  const productVariantProps = await getServerSideProps(getProductQueryString(product.handle, variantCount)) as any;

                  if (productVariantProps.props.data) {
                    const productVariant = productVariantProps.props.data.product;

                    setModalDetails({ product: productVariant });
                  }
                }}
              >
                <div className="bg-white/90 backdrop-blur-sm py-3 px-4 text-center">
                  <span className="font-source text-sm font-medium text-brand-navy tracking-wide">
                    View Details
                  </span>
                </div>
              </div>
            </>
          )
        }
        {/* Corner Accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Product Information */}
      <div className="relative">
        <h4
          className='font-playFair text-lg text-brand-navy mb-2 group-hover:text-brand-gold transition-color duration-500'
        >
          {product.title}
        </h4>
        <div className="flex justify-between item-baseline">
          {
            !hidePrice && (
              <Money
                data={product.priceRange.minVariantPrice}
                className='font-source text-gray-600 group-hover:text-brand-navy transition-colors duration-500'
              />
            )
          }
          <span className='flex items-center font-source text-sm text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity-500'>
            Explore
            <ArrowRight className='ml-1 w-4 h-4' />
          </span>
        </div>
      </div>
    </Link>
    <Modal
      open={ openModal }
      closeModal={() => {
        setOpenModal(false);
      }}
    >
      <section style={{ width: '100%', height: '100%' }}>
        {
          modalDetails.product && (
            <>
            {
              <Product
                product={ modalDetails.product }
                hideAdditionalInfo={ true }
                isFullPage={ false }
              />
            }
            </>
          )
        }
      </section>
    </Modal>
    </>
  );
}

const getProductQueryString = (productHandle: string, variantCount: number): string => {
  return `#graphql
    query Product(
      $handle: String = "${ productHandle }",
      $variantCount: Int = ${ variantCount }
      ) {
      product(handle: $handle) {
        images(first: 10) {
          nodes {
            url
            id
            altText
            height
            width
          }
        }
        id
        title
        selectedOrFirstAvailableVariant {
          product {
            handle
            title
          }
          price {
            amount
            currencyCode
          }
          id
          availableForSale
          compareAtPrice {
            amount
            currencyCode
          }
          sku
          title
        }
        variantsCount {
          count
        }
        variants(first: $variantCount) {
          nodes {
            ...ProductVariant
          }
        }
        adjacentVariants {
          ...ProductVariant
        }
      }
    }
    ${PRODUCT_VARIANT_FRAGMENT}
  `;
};

const getProductVariantQueryString = (productHandle: string): string => {
  return `#graphql
    query Product(
      $handle: String = "${ productHandle }",
    ) {
      product(handle: $handle) {
        variantsCount {
          count
        }
      }
    }
  `;
};

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      altText
      height
      id
      url
      width
    }
    price {
      amount
      currencyCode
    }
    priceV2 {
      amount
      currencyCode
    }
    product {
      handle
      title
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

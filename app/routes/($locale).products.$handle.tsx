import {Suspense} from 'react';
import {redirect, useLoaderData, Await} from 'react-router';

import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...criticalData,
    variants: deferredData.variants,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  const {handle} = params;
  const {storefront} = context;

  return {
    variants: storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: []},
    }),
  };
}

export default function Product() {
  const {product, variants} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml } = product;

  return (
    <div className="pt-48 pb-20 md:pt-48 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left side Images */}
          <div className="space-y-8">
            <ProductImage
              images={ product.images.nodes.map(node => ({
                id: node.id,
                url: node.url,
                altText: node.altText,
                width: node.width,
                height: node.height
              }))}
              selectedVariantImage={ selectedVariant.image }
            />
          </div>

          {/* Right side - Details & CTA */}
          <div className="space-y-10">
            {/* Product Title & Price */}
            <div className="space-y-4 border-b border-brand-navy/10 pb-6">
              <h1 className="font-playFair text-3xl md:text-4x1 lg:text-5xl text-brand-navy">
                { title }
              </h1>
              <ProductPrice
                price={ selectedVariant?.price }
                compareAtPrice={ selectedVariant?.compareAtPrice }
                className='font-source text-xl text-brand-navy'
              />
            </div>

            {/* Product Form */}
            <Suspense>
              <Await resolve={ variants }>
                {
                  (data) => (
                    <ProductForm
                      product={ productOptions }
                      selectedVariant={ selectedVariant }
                      className='space-y-8'
                    />
                  )
                }
              </Await>
            </Suspense>

            {/* Product Description */}
            <div className="mt-12 border-t border-brand-navy/10">
              <div className="grid grid-cols-1 divide-y divide-brand-navy/10">
                <details className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-playFair text-lg text-brand-navy">Product Description</h3>
                    <span className="relative flex-shrink-0 ml-4 w-4 h-4">
                      <svg
                        className='absolute inset-0 w-4 h-4 transition duration-300 group-open:rotate-180'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pt-4 prose font-source text-brand-navy/80">
                    <div
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
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
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

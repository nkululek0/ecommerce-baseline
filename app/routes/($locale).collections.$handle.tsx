import {redirect, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import { SortProducts } from '~/components/SortProducts';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const url = new URL(request.url);
  const reverseSearchParam = url.searchParams.get("reverse");
  let castedReverseSearchParam;

  if (reverseSearchParam) {
    castedReverseSearchParam = reverseSearchParam == "true";
  }

  const sortVariables = {
    reverse: castedReverseSearchParam || false,
    sortKey: url.searchParams.get("sortKey") || 'ID'
  };

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables, ...sortVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    url
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const { collection, url } = useLoaderData<typeof loader>();

  return (
    <>
    {/* Hero Section */}
    <section className="relative h-[50vh] min-h-[400px] pt-[10rem] md:pt-[9rem] bg-brand-navy">
      <div className="absolute inset-0">
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/50 to-brand-navy/80" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="font-playFair text-4xl md:text-6xl text-white mb-6">{ collection.title }</h1>
          <p className="font-source text-leg text-gray-200 mb-8 max-w-xl">{ collection.description }</p>
        </div>
      </div>
    </section>

    {/* Collection Section */}
    <section className="bg-brand-cream border-y border-brand-navy/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 px-4 gap-4">
          <div className='space-y-2'>
            <h2 className='font-playFair text-2xl text-brand-navy'>
              The Collection
            </h2>
            <p className='font-source text-brand-navy/60'>
              Showing { collection.products.nodes.length } products
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Products Grid */}
    <section className="bg-white py-8 md:py-12">
      <div className='w-full container mx-auto mb-4 px-4 flex items-center justify-between gap-6'>
        <button className='font-source text-sm text-brand-navy/60 hover:text-brand-navy transition-color'>
          Filter:
        </button>
        <SortProducts url={ url } />
      </div>
      <div className="container mx-auto px-4">
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </section>
    </>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $reverse: Boolean
    $sortKey: ProductCollectionSortKeys
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        reverse: $reverse,
        sortKey: $sortKey
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;

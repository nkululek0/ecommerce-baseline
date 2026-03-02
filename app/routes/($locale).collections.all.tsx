import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Products`}];
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
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
  const {products} = useLoaderData<typeof loader>();

  return (
    <>
    {/* Hero Section */}
    <section className="relative h-[80vh] min-h-[600px] bg-brand-navy">
      <div className="absolute inset-0">
        <Image
          data={{
            url: '/images/craftsman-in-shop.jpg',
            width: 1920,
            height: 1000
          }}
          alt='Craftsmanship'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 22vw'
          loading='eager'
          className='absolute inset-0 w-full h-full object-cover opacity-70'
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/50 to-brand-navy/80" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="font-playFair text-4xl md:text-6xl text-white mb-6">Artisanal Excellence</h1>
          <p className="font-source text-leg text-gray-200 mb-8 max-w-xl">Where time-honored techniques meet contemporary sophistication.</p>
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
              Showing { products.nodes.length } products
            </p>
          </div>
          <div className='flex items-center gap-6'>
            <button className='font-source text-sm text-brand-navy/60 hover:text-brand-navy transition-color'>
              Filter
            </button>
            <button className='font-source text-sm text-brand-navy/60 hover:text-brand-navy transition-color'>
              Sort
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Products Grid */}
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="grid grid-cols-1 md:grid-cols2 lg:grid-cols-3 gap-16"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </section>
    </>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;

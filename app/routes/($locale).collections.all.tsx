import type {Route} from './+types/collections.all';
import {useLoaderData, Link} from 'react-router';
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
async function loadCriticalData({context, request }: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products, collections}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return { products, collections };
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
  const { collections } = useLoaderData<typeof loader>();

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
              The Catalog
            </h2>
            <p className='font-source text-brand-navy/60'>
              {
                collections.nodes.length <= 2 && (
                  'Showing 1 category'
                )
              }
              {
                collections.nodes.length >= 3 && (
                  `Showing ${ collections.nodes.length - 1 } categories`
                )
              }
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Products Grid */}
    <section className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="container mx-auto">
          <h2 className="font-playFair text-3xl text-center mb-12">Our Popular Categories</h2>
        </div>
        <section className='grid grid-cols-1 md:grid-cols2 lg:grid-cols-3 gap-16'>
          {
            collections.nodes.map((item, index) => {
              if (index > 0) {
                return (
                  <>
                  <Link
                    key={ index }
                    prefetch='intent'
                    to={`/collections/${ item.handle }`}
                    className="group block relative"
                  >
                    {/* Image Container with hover effects */}
                    <div className="relative aspect-square overflow-hidden bg-brand-cream mb-2">
                      {
                        item.image && (
                          <>
                            <Image
                              alt={ item.image.altText || item.title }
                              data={ item.image }
                              loading='lazy'
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors duration-500" />
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
                        className='font-playFair text-lg text-brand-navy group-hover:text-brand-gold transition-color duration-500'
                      >
                        { item.title }
                      </h4>
                    </div>
                  </Link>
                  </>
                );
              }
            })
          }
        </section>
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
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
    ) {
      nodes {
        id
        handle
        title
        image {
          url
          id
          altText
          width
          height
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
    ) {
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

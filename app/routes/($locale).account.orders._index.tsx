import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/($locale).account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="bg-brand-cream">
      <div className="orders container mx-auto px-4 sm:px-6 pt-48 pb-20 md:pt-48 md:pb-20">
        <h2 className="font-playFair text-brand-navy text-2xl md:text-3xl mb-6">
          Orders
        </h2>
        <div className="p-8 bg-white w-100 rounded-xl">
          {
            orders?.nodes.length > 0 && ( <OrderSearchForm currentFilters={filters} /> )
          }
          <OrdersTable orders={orders} filters={filters} />
        </div>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="acccount-orders" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className='flex flex-col justify-center items-center'>
      {hasFilters ? (
        <>
          <p>No orders found matching your search.</p>
          <br />
          <p>
            <Link to="/account/orders">Clear filters →</Link>
          </p>
        </>
      ) : (
        <>
          <p>You haven&apos;t placed any orders yet.</p>
          <br />
          <p>
            <Link to="/collections/all">Start Shopping →</Link>
          </p>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label="Search orders"
    >
      <fieldset className="order-search-fieldset">
        <legend className="order-search-legend">Filter Orders</legend>

        <div className="order-search-inputs">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="order-search-input"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="order-search-input"
          />
        </div>

        <div className="order-search-buttons">
          <button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <>
      <div className='md:hidden'>
        <fieldset className='border-solid border-[#00000025] border-[1px] rounded-[4px]'>
          <div className='border-solid border-[#00000025] border-b-[1px]'>
            <p className="p-[1rem] bg-[#F5F5F5]">Order</p>
            <p className='p-[1rem]'>
              <Link className='block w-100 h-100 underline' to={`/account/orders/${btoa(order.id)}`}>
                #{order.number}
              </Link>
            </p>
          </div>
          <div className="border-solid border-[#00000025] border-b-[1px]">
            <p className="p-[1rem] bg-[#F5F5F5]">Purchase Date</p>
            <p className='p-[1rem]'>{new Date(order.processedAt).toDateString()}</p>
          </div>
          {order.confirmationNumber && (
            <div className='border-solid border-[#00000025] border-b-[1px]'>
              <p className="p-[1rem] bg-[#f5f5f5]">Confirmation Code</p>
              <p className='p-[1rem]'>{order.confirmationNumber}</p>
            </div>
          )}
          <div className="border-solid border-[#00000025] border-b-[1px]">
            <p className="p-[1rem] bg-[#f5f5f5]">Payment Status</p>
            <p className='p-[1rem]'>{order.financialStatus}</p>
          </div>
          {/* {fulfillmentStatus && <p>{fulfillmentStatus}</p>} */}
          <div className="border-solid border-[#00000025] border-b-[1px]">
            <p className="p-[1rem] bg-[#f5f5f5]">Order Total</p>
            <p className="p-[1rem]">
              <Money data={order.totalPrice} />
            </p>
          </div>
          <div className="p-[1rem]">
            <Link className='block w-max p-[0.5rem] text-white bg-brand-gold hover:bg-brand-goldDark transition-colors duration-300 rounded-md font-source' to={`/account/orders/${btoa(order.id)}`}>View Order</Link>
          </div>
        </fieldset>
        <br />
      </div>

      <fieldset className='md:block hidden'>
        <Link to={`/account/orders/${btoa(order.id)}`}>
          <strong>#{order.number}</strong>
        </Link>
        <p>{new Date(order.processedAt).toDateString()}</p>
        {order.confirmationNumber && (
          <p>Confirmation: {order.confirmationNumber}</p>
        )}
        <p>{order.financialStatus}</p>
        {fulfillmentStatus && <p>{fulfillmentStatus}</p>}
        <Money data={order.totalPrice} />
        <Link to={`/account/orders/${btoa(order.id)}`}>View Order →</Link>
      </fieldset>
    </>
  );
}

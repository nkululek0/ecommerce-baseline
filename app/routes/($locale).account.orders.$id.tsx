import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import { ChevronDown } from 'lucide-react';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="bg-brand-cream md:hidden">
        <div className="orders account-order container mx-auto px-4 sm:px-6 pt-48 pb-20 md:pt-48 md:pb-20">
          <details className='group p-4 mb-2 rounded-xl bg-[#fff]'>
            <summary className='flex items-center justify-between gap-1 cursor-pointer list-none'>
              <div className='flex items-center gap-1'>
                <p>Order Summary</p>
                <ChevronDown className="w-4 h-4 transition duration-300 group-open:rotate-180" />
              </div>
              <b>
                <Money data={order.totalPrice!} />
              </b>
            </summary>
            <div>
              <div className="mt-4">
                {lineItems.map((lineItem, lineItemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                ))}
              </div>
              <div className='flex flex-col gap-1 mt-[0.5rem]'>
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <Money data={order.subtotal!} />
                </div>
                <div className='flex justify-between'>
                  <p>Tax</p>
                  <Money data={order.totalTax!} />
                </div>
              </div>
            </div>
          </details>
          <h2>Order {order.name}</h2>
          <p>Placed on {new Date(order.processedAt!).toDateString()}</p>
          {/* {order.confirmationNumber && (
            <p>Confirmation: {order.confirmationNumber}</p>
          )} */}
          <br />
          <div>
            <table>
              {/* <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                </tr>
              </thead> */}
              {/* <tbody> */}
                {/* {lineItems.map((lineItem, lineItemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                ))} */}
              {/* </tbody> */}
              <tfoot>
                {/* {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th scope="row" colSpan={3}>
                      <p>Discounts</p>
                    </th>
                    <th scope="row">
                      <p>Discounts</p>
                    </th>
                    <td>
                      {discountPercentage ? (
                        <span>-{discountPercentage}% OFF</span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )} */}
              </tfoot>
            </table>
            <div>
              <h3>Shipping Address</h3>
              {order?.shippingAddress ? (
                <address>
                  <p>{order.shippingAddress.name}</p>
                  {order.shippingAddress.formatted ? (
                    <p>{order.shippingAddress.formatted}</p>
                  ) : (
                    ''
                  )}
                  {order.shippingAddress.formattedArea ? (
                    <p>{order.shippingAddress.formattedArea}</p>
                  ) : (
                    ''
                  )}
                </address>
              ) : (
                <p>No shipping address defined</p>
              )}
              <h3>Status</h3>
              <div>
                <p>{fulfillmentStatus}</p>
              </div>
            </div>
          </div>
          <br />
        </div>
      </div>

      {/* Tablet to desktop view */}
      <div className="bg-brand-cream hidden md:block">
        <div className="orders account-order container mx-auto px-4 sm:px-6 pt-48 pb-20 md:pt-48 md:pb-20">
          <h2>Order {order.name}</h2>
          <p>Placed on {new Date(order.processedAt!).toDateString()}</p>
          {/* {order.confirmationNumber && (
            <p>Confirmation: {order.confirmationNumber}</p>
          )} */}
          <br />
          <div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((lineItem, lineItemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                ))}
              </tbody>
              <tfoot>
                {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th scope="row" colSpan={3}>
                      <p>Discounts</p>
                    </th>
                    <th scope="row">
                      <p>Discounts</p>
                    </th>
                    <td>
                      {discountPercentage ? (
                        <span>-{discountPercentage}% OFF</span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <th scope="row" colSpan={3}>
                    <p>Subtotal</p>
                  </th>
                  <th scope="row">
                    <p>Subtotal</p>
                  </th>
                  <td>
                    <Money data={order.subtotal!} />
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={3}>
                    Tax
                  </th>
                  <th scope="row">
                    <p>Tax</p>
                  </th>
                  <td>
                    <Money data={order.totalTax!} />
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={3}>
                    Total
                  </th>
                  <th scope="row">
                    <p>Total</p>
                  </th>
                  <td>
                    <Money data={order.totalPrice!} />
                  </td>
                </tr>
              </tfoot>
            </table>
            <div>
              <h3>Shipping Address</h3>
              {order?.shippingAddress ? (
                <address>
                  <p>{order.shippingAddress.name}</p>
                  {order.shippingAddress.formatted ? (
                    <p>{order.shippingAddress.formatted}</p>
                  ) : (
                    ''
                  )}
                  {order.shippingAddress.formattedArea ? (
                    <p>{order.shippingAddress.formattedArea}</p>
                  ) : (
                    ''
                  )}
                </address>
              ) : (
                <p>No shipping address defined</p>
              )}
              <h3>Status</h3>
              <div>
                <p>{fulfillmentStatus}</p>
              </div>
            </div>
          </div>
          <br />
          <p>
            <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
              View Order Status →
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <>
      <div key={lineItem.id} className='flex items-start justify-between gap-[0.5rem] border-solid border-b-[1px] border-[#00000025] pb-4'>
        {lineItem?.image && (
          <div>
            <Image data={lineItem.image} width={96} height={96} />
          </div>
        )}
        <div className='flex flex-col'>
          <p className='leading-[18px]'>{lineItem.title}</p>
          <small className='text-[#0000008f]'>{lineItem.variantTitle}</small>
          <small className='text-[#0000008f]'>Items: {lineItem.quantity}</small>
          {/* <small>
            <Money data={lineItem.totalDiscount!} />
          </small> */}
        </div>
        <div>
          <p>
            <Money data={lineItem.price!} />
          </p>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useNavigate,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/($locale).account.profile';
import { Modal } from '~/components/Modal';
import { Pencil, Plus, CircleAlert } from 'lucide-react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = account?.customer;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="account-profile bg-brand-cream">
      <div className="orders container mx-auto px-4 sm:px-6 pt-48 pb-20 md:pt-48 md:pb-20">
        <h2 className='font-playFair text-brand-navy text-2xl md:text-3xl mb-12'>My profile</h2>
        <div className="p-8 bg-white w-100 rounded-xl mb-6">
          <div className='flex items-center gap-3 mb-5'>
            <p className='text-brand-navy/60'>Personal information</p>
            <Pencil
              className='w-3.5 h-3.5 text-brand-gold cursor-pointer'
              onClick={() => {
                setIsOpenModal(true);
              }}
            />
          </div>
          <div>
            <p className='text-brand-navy/60'>Email</p>
            <p>{ customer.emailAddress?.emailAddress }</p>
          </div>
        </div>
        <div className="p-8 bg-white w-100 rounded-xl">
          <div className='flex gap-3 mb-5'>
            <h3>Addresses</h3>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                navigate('/account/addresses');
              }}
            >
              <Plus className='w-3.5 h-3.5 text-brand-gold cursor-pointer'/>
              <p className="text-brand-gold">Add</p>
            </div>
          </div>
          <div className="">
            {
              customer.addresses.nodes.length == 0 && (
                <div className='flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F5] border border-transparent outline outline-[1px] outline-[#00000025] outline-offset-[-1px]'>
                  <CircleAlert className='w-5 h-5' />
                  <span>No addresses added</span>
                </div>
              )
            }
            {
              customer.addresses.nodes.length > 0 && customer.addresses.nodes.map((address) => {
                const addressLayout = (
                  <>
                  <ul>
                    <li>{ address.firstName } { address.lastName }</li>
                    { address.formatted.map((item) => ( <li>{ item }</li> )) }
                    <li>{ address.phoneNumber }</li>
                  </ul>
                  </>
                );

                if (address.id == customer.defaultAddress?.id) {
                  return (
                    <>
                    <p className="text-brand-navy/60 mb-3">Default address</p>
                    { addressLayout }
                    </>
                  );
                }
                else {
                  return addressLayout
                }
              })
            }
          </div>
        </div>
      </div>
      <Modal
        open={ isOpenModal }
        closeModal={ () => { setIsOpenModal(false) } }
        dynamicDimensions={ true }
      >
        {
          <PersonalInformation
            customer={ customer }
            action={ action }
            state={ state }
          />
        }
      </Modal>
    </div>
  );
};

const PersonalInformation = ({
  customer,
  action,
  state
}: {
  customer: CustomerFragment,
  action: ActionResponse | undefined,
  state: "idle" | "loading" | "submitting"
}) => {
  return (
    <>
    <section style={{ width: '100%', height: '100%' }}>
      {
        <Form method="PUT" className='pb-5'>
          <legend className='mb-6 font-playFair text-xl text-brand-navy'>Personal information</legend>
          <fieldset>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              className={` w-full md:w-[48%] md:mr-[4%] mb-3 p-3 rounded-md border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source` }
            />
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              className={` w-full md:w-[48%] mb-3 p-3 rounded-md border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source`}
            />
          </fieldset>
          <fieldset>
            <input
              id="emailAddress"
              name="emailAddress"
              type="text"
              placeholder='Email Address'
              aria-label="Email Address"
              defaultValue={customer.emailAddress?.emailAddress ?? ''}
              minLength={5}
              className='w-full mb-5 p-3 rounded-md border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source'
            />
          </fieldset>
          {action?.error ? (
            <p>
              <mark>
                <small>{action.error}</small>
              </mark>
            </p>
          ) : (
            <br />
          )}
          <button
            type="submit"
            disabled={state !== 'idle'}
            className='h-max w-max px-3 py-1 text-white bg-brand-gold hover:bg-brand-goldDark transition-colors duration-300 rounded-md font-source'
          >
            {state !== 'idle' ? 'Updating' : 'Update'}
          </button>
        </Form>
      }
    </section>
    </>
  );
};
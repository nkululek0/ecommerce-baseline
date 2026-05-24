import {useEffect} from 'react';
import {useFetcher} from 'react-router';

export type Customer = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: {
    emailAddress: string
  } | null;
};

type CustomerResponse = {
  isLoggedIn: boolean;
  customer: Customer | null;
};

export function useCustomer() {
  const fetcher = useFetcher<CustomerResponse>();

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data == null) {
      fetcher.load('/api/customer');
    }
  }, [fetcher]);

  return {
    isLoading: fetcher.state !== 'idle' && fetcher.data == null,
    isLoggedIn: fetcher.data?.isLoggedIn ?? false,
    customer: fetcher.data?.customer ?? null,
  };
};
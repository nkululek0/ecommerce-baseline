import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown } from "lucide-react";

type KeyAndValueObjType = { [key: string]: string };

const sortKeysAndValueObj: KeyAndValueObjType = {
  "Featured": "sortKey=ID&reverse=false",
  "Alphabetically, A-Z": "sortKey=TITLE&reverse=false",
  "Alphabetically, Z-A": "sortKey=TITLE&reverse=true",
  "Price, Low-High": "sortKey=PRICE&reverse=false",
  "Price, High-Low": "sortKey=PRICE&reverse=true"
};

const reverseSortKeysAndValueObj = (): KeyAndValueObjType => {
  const result: KeyAndValueObjType = {};

  Object.keys(sortKeysAndValueObj).forEach((item) => {
    const value = sortKeysAndValueObj[item];

    result[value] = item;
  });

  return result;
};

const sortKeysAndValueObjReversed: KeyAndValueObjType = reverseSortKeysAndValueObj();

type ProductsFilter = {
  [key: string] : string | boolean | undefined
  available?: "all" | "true" | "false"
  price_lt?: string
  price_gt?: string
};

type ProductSorting = {
  [key: string] : string | boolean | undefined
  reverse?: boolean
  sortKey?: string
};

const ProductsFilterHelper = {
  available: "all",
  price_gt: "",
  price_lt: ""
} satisfies ProductsFilter;

const ProductSortingHelper = {
  reverse: false,
  sortKey: ""
} satisfies ProductSorting;

const getSearchParam = (searchParamObj: ProductsFilter & ProductSorting): string => {
  let searchParamResult = "?";
  const filterParamKeys = Object.keys(ProductsFilterHelper);

  for (let i = 0; i < filterParamKeys.length; i++) {
    const key = filterParamKeys[i];
    const value = `filter.${ key }=${ searchParamObj[key] != null ? searchParamObj[key] : "" }`;

    if (i == 0) {
      searchParamResult += value;
    }
    else {
      searchParamResult += `&${ value }`;
    }
  }

  const sortParamKeys = Object.keys(ProductSortingHelper);

  for (let i = 0; i < sortParamKeys.length; i++) {
    const key = sortParamKeys[i];
    const value = `${ key }=${ searchParamObj[key] }`;

    if (i == 0 && searchParamResult == "?") {
      searchParamResult = `?${ value }`;
    }
    else {
      searchParamResult += `&${ value }`;
    }
  }

  return searchParamResult;
};

const productFilterAvailabilityKeyValues: KeyAndValueObjType = {
  "All": "all",
  "In stock": "true",
  "Out of Stock": "false"
};

let sortListClickCount = 0;
const handleSortListToggle = () => {
  sortListClickCount += 1;

  if (sortListClickCount == 2) {
    sortListClickCount = 0;
  }

  document.querySelector('[data-sort-list]')?.classList.toggle('hidden');
  document.querySelector('[data-sort-dropdown-arrow]')?.classList.toggle('rotate-180');
};

let filterListClickCount = 0;
const handleFilterListToggle = () => {
  filterListClickCount += 1;

  if (filterListClickCount == 2) {
    filterListClickCount = 0;
  }

  document.querySelector('[data-filter-main]')?.classList.toggle('hidden');
  document.querySelector('[data-filter-main-dropdown-arrow]')?.classList.toggle('rotate-180');
};

type SortAndFilterProductsProps = {
  url: URL
  filtering: ProductsFilter
  sorting: ProductSorting
  currency: string
};

export function SortAndFilterProducts (props: SortAndFilterProductsProps) {
  const { url, filtering, sorting, currency } = props;
  const currentSearchParam = useRef<ProductsFilter & ProductSorting>({...filtering, ...sorting});
  const currentSearchParamString = useRef(getSearchParam(currentSearchParam.current));
  const [selectedFilterAvailability, setSelectedFilterAvailability] = useState("");
  const filterPricingInputs = { minPrice: useRef<HTMLInputElement>(null), maxPrice: useRef<HTMLInputElement>(null) };
  const [appliedFilters, setAppliedFilters] = useState<Array<string>>([]);
  const navigate = useNavigate();
  const applySearchParam = () => {
    navigate(currentSearchParamString.current, { replace: true, preventScrollReset: true });
  };

  const handleSetSearchParam = (paramKey: string, paramValue: string | boolean) => {
    currentSearchParam.current[paramKey] = paramValue;
    currentSearchParamString.current = getSearchParam(currentSearchParam.current);
  };

  const resetFilterSearchParam = () => {
    const filterParamKeys = Object.keys(ProductsFilterHelper);

    for (const key of filterParamKeys) {
      if (key == "available") {
        currentSearchParam.current[key] = "all";
        setSelectedFilterAvailability("");
      }
      else currentSearchParam.current[key] = "";
    }

    if (filterPricingInputs.minPrice.current?.value) filterPricingInputs.minPrice.current.value = "";
    if (filterPricingInputs.maxPrice.current?.value) filterPricingInputs.maxPrice.current.value = "";

    setAppliedFilters([]);
    currentSearchParamString.current = getSearchParam(currentSearchParam.current);
  }

  const windowMouseClickEvent = () => {
    if (sortListClickCount == 1) {
      handleSortListToggle();
    }
    if (filterListClickCount == 1) {
      handleFilterListToggle();
    }
  };

  useEffect(() => {
    window.addEventListener("click", windowMouseClickEvent);

    return () => {
      window.removeEventListener("click", windowMouseClickEvent);
    };
  }, []);

  return (
    <>
    <div className="flex gap-3">
      <p className="pt-1.5 font-source text-sm text-brand-navy/60">Filter:</p>
      <div
        className="relative cursor-pointer w-[165px]"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleFilterListToggle();
        }}
      >
        <p className="flex items-center justify-center gap-1 px-3 py-1 border border-1 border-[#000] transition duration-300">
          <span>
            {
              appliedFilters.length == 0 && (
                'None'
              )
            }
            {
              appliedFilters.length == 1 && (
                '1 Filter Applied'
              )
            }
            {
              appliedFilters.length >= 2 && (
                `${ appliedFilters.length } Filters Applied`
              )
            }
          </span>
          <ChevronDown data-filter-main-dropdown-arrow className="w-4 h-4" />
        </p>
        <div
          data-filter-main
          className='z-10 hidden absolute w-[400px] grid grid-cols-1 divide-y divide-brand-navy/10 p-[1rem] bg-white'
        >
          <details
            className="group mb-2"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <summary className="flex items-center gap-1 cursor-pointer list-none">
              <p className='py-1'>Availability</p>
              <ChevronDown data-filter-availability-dropdown-arrow className="w-4 h-4 transition duration-300 group-open:rotate-180" />
            </summary>
            <div>
              {
                Object.keys(productFilterAvailabilityKeyValues).map((key, index) => (
                  <div
                    key={ index }
                    onClick={() => {
                      setSelectedFilterAvailability(key.toLocaleLowerCase());
                      handleSetSearchParam("available", productFilterAvailabilityKeyValues[key]);
                      handleFilterListToggle();
                      setAppliedFilters((current) => {
                        const currentValue = [...current];

                        if (!currentValue.includes("available")) {
                          currentValue.push("available");
                        }

                        return currentValue;
                      })
                      applySearchParam();
                    }}
                    className={`w-full flex items-center gap-1 py-0.5`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={ key.toLocaleLowerCase() }
                      checked={ selectedFilterAvailability == key.toLocaleLowerCase() }
                      readOnly
                      className='cursor-pointer'
                    />
                    <label htmlFor={ key.toLocaleLowerCase() } className='cursor-pointer'>{ key }</label>
                  </div>
                ))
              }
            </div>
          </details>
          <details
            className="group w-full"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <summary className="flex items-center gap-1 cursor-pointer list-none my-2">
              <p className='py-1'>Price</p>
              <ChevronDown data-filter-price-dropdown-arrow className="w-4 h-4 transition duration-300 group-open:rotate-180" />
            </summary>
            <form
              className='w-full'
              onSubmit={(event) => {
                event.preventDefault();

                const minPrice = filterPricingInputs.minPrice.current?.value || "";
                const maxPrice = filterPricingInputs.maxPrice.current?.value || "";

                handleSetSearchParam("price_gt", minPrice);
                handleSetSearchParam("price_lt", maxPrice);
                setAppliedFilters((current) => {
                  const currentValue = [...current];

                  if (minPrice == "" && maxPrice == "") {
                    return currentValue.filter((item) => item != "price");
                  }
                  else if (!currentValue.includes("price")) {
                    currentValue.push("price");
                  }

                  return currentValue;
                });
                handleFilterListToggle();
                applySearchParam();
              }}
            >
              <div className="flex items-center gap-4 w-full mb-2">
                <div className='flex items-center gap-1 w-[50%]'>
                  <label>{ currency }:</label>
                  <input
                    ref={ filterPricingInputs.minPrice }
                    defaultValue={ currentSearchParam.current.price_gt }
                    type="number"
                    placeholder="Min"
                    className="w-[80%] px-2 py-1 border border-1 border-gray"
                    onClick={(event) => {
                      event.preventDefault();
                    }}
                  />
                </div>
                <div className='flex items-center gap-1 w-[50%]'>
                  <label>{ currency }:</label>
                  <input
                    ref={ filterPricingInputs.maxPrice }
                    defaultValue={ currentSearchParam.current.price_lt }
                    type="number"
                    placeholder="Max"
                    className="w-[80%] px-2 py-1 border border-1 border-gray"
                    onClick={(event) => {
                      event.preventDefault();
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className='w-full py-2.5 mt-1 text-white font-source text-base tracking-wider bg-brand-navy hover:bg-brand-navyLight'
              >
                Apply
              </button>
            </form>
          </details>
        </div>
      </div>
      {
        appliedFilters.length > 0 && (
          <p
            className="pt-1.5 font-source text-sm text-brand-navy/60 duration-300 transition-colors hover:text-brand-navy cursor-pointer"
            onClick={() => {
              resetFilterSearchParam();
              applySearchParam();
            }}
          >
            clear filters
          </p>
        )
      }
    </div>
    <div className="flex gap-3">
      <p className='pt-1.5 font-source text-sm text-brand-navy/60'>Sort:</p>
      <div
        className="relative w-[190px] cursor-pointer"
        onClick={
          (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSortListToggle();
          }
        }
      >
        <p className="flex items-center justify-center gap-1 w-full px-3 py-1 border border-1 border-[#000] transition duration-300">
          <span data-active-sort-value>{ sortKeysAndValueObjReversed[url.search.substring(1)] || 'Featured' }</span><ChevronDown data-sort-dropdown-arrow className="w-4 h-4" />
        </p>
        <ul data-sort-list className="hidden absolute z-[10] w-full bg-white">
          {
            Object.keys(sortKeysAndValueObj).map((key, index) => {
              const searchParamArr = sortKeysAndValueObj[key].split("&");
              const sortKey = searchParamArr[0].substring((searchParamArr[0].indexOf("=") + 1));
              const reverse = searchParamArr[1].substring((searchParamArr[1].indexOf("=") + 1));

              return (
                <li
                  key={ index }
                  onClick={(event) => {
                    event.stopPropagation();

                    const target = event.target as HTMLLIElement;

                    document.querySelector("[data-active-sort-value]")?.setHTMLUnsafe(target.innerHTML);
                    handleSortListToggle();
                  }}
                  className="w-full"
                >
                  <span
                    onClick={() => {
                      handleSetSearchParam("sortKey", sortKey);
                      handleSetSearchParam("reverse", reverse == "true");
                      applySearchParam();
                    }}
                    className="block px-3 py-1 w-full border border-1 border-transparent hover:border-brand-gold hover:text-brand-gold"
                  >
                    { key }
                  </span>
                </li>
              );
            })
          }
        </ul>
      </div>
    </div>
    </>
  );
};
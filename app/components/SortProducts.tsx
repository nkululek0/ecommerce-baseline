import React, { useRef } from "react";
import { Link } from 'react-router';
import { ChevronDown } from "lucide-react";

type KeyAndValueObjType = { [key: string]: string };

const sortKeysAndValueObj: KeyAndValueObjType = {
  "Featured": "?sortKey=ID&reverse=false",
  "Alphabetically, A-Z": "?sortKey=TITLE&reverse=true",
  "Alphabetically, Z-A": "?sortKey=TITLE&reverse=false",
  "Price, Low-High": "?sortKey=PRICE&reverse=false",
  "Price, High-Low": "?sortKey=PRICE&reverse=true"
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

type SortProductsProps = {
  url: URL
};

export function SortProducts (props: SortProductsProps) {
  const { url } = props;
  const toggleListElement = useRef<HTMLParagraphElement>(null);

  const handleListToggle = (event: React.MouseEvent<HTMLParagraphElement>) => {
    event.stopPropagation();
    event.preventDefault();

    toggleListElement.current?.nextElementSibling?.classList.toggle('hidden');
    document.querySelector('[data-sort-dropdown-arrow]')?.classList.toggle('rotate-180');
  };

  const handleSort = (event: React.MouseEvent<HTMLLIElement>) => {
    event.stopPropagation();

    const target = event.target as HTMLLIElement;

    document.querySelector("[data-active-sort-value]")?.setHTMLUnsafe(target.innerHTML);
    toggleListElement.current?.nextElementSibling?.classList.toggle('hidden');
    document.querySelector('[data-sort-dropdown-arrow]')?.classList.toggle('rotate-180');
  };

  return (
    <>
    <div className="flex gap-3">
      <p
        className='pt-1.5 font-source text-sm text-brand-navy/60'
      >
        Sort:
      </p>
      <div className="relative w-[190px] cursor-pointer">
        <p
          ref={ toggleListElement }
          onClick={ handleListToggle }
          className="flex items-center justify-center gap-1 w-full px-3 py-1 border border-1 border-[#000] transition duration-300"
        >
          <span data-active-sort-value>{ sortKeysAndValueObjReversed[url.search] || 'Featured' }</span><ChevronDown data-sort-dropdown-arrow className="w-4 h-4" />
        </p>
        <ul className="hidden absolute z-[10] w-full bg-white">
          {
            Object.keys(sortKeysAndValueObj).map((key, index) => (
              <li
                key={ index }
                onClick={ handleSort }
                className="px-3 py-1 border border-1 border-transparent hover:border-brand-gold hover:text-brand-gold"
              >
                <Link
                  prefetch="intent"
                  preventScrollReset
                  replace
                  to={`${ url.pathname }${ sortKeysAndValueObj[key] }`}
                >
                  { key }
                </Link>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
    </>
  );
};
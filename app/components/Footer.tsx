import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

import Instagram from '/icons/instagram.svg';
import Facebook from '/icons/facebook.svg';
import X from '/icons/x.svg';
import { Mail, MapIcon, Phone } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-brand-navy text-white">
            {/* Newsletter Signup */}
            <NewsletterForm />

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-6">
                  <h3 className="font-playFair text-2xl">BASELINE</h3>
                  <p className="font-source text-sm text-gray-300 leading-relaxed">
                    Crafted with precision, designed for distinction.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-white-80 hover:text-brand-gold transition-colors duration-300"
                    >
                      <img
                        src={ Instagram }
                        className='w-5 h-5'
                      />
                    </a>
                    <a
                      href="#"
                      className="text-white-80 hover:text-brand-gold transition-colors duration-300"
                    >
                      <img
                        src={ Facebook }
                        className='w-5 h-5'
                      />
                    </a>
                    <a
                      href="#"
                      className="text-white-80 hover:text-brand-gold transition-colors duration-300"
                    >
                      <img
                        src={ X }
                        className='w-5 h-5'
                      />
                    </a>
                  </div>
                </div>

                {/* Contact Column */}
                <div className="space-y-6">
                  <h4 className="font-playFair text-lg">Contact</h4>
                  <ul className="space-y-4 font-source text-sm text-gray-400">
                    <li className="flex items-start space-x-3">
                      <MapIcon className='w-5 h-5 text-brand-gold flex-shrink-0' />
                      <span>123 Example Ave<br /> Forgettable Lane, Some place 2000</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Phone className='w-5 h-5 text-brand-gold flex-shrink-0' />
                      <span>+27 123 456 7890</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Mail className='w-5 h-5 text-brand-gold flex-shrink-0' />
                      <span>email@example.com</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Links Column */}
                <div className="space-y-6">
                  <h4 className="font-playFair text-lg">Quick Links</h4>
                  <ul className="space-y-3 font-source text-sm">
                    <li>
                      <NavLink
                        to='/collections/all'
                        className='text-gray-300 hover:text-brand-gold transition-colors duration-300'
                      >
                        Products
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to='/pages/our-craft'
                        className='text-gray-300 hover:text-brand-gold transition-colors duration-300'
                      >
                        Our Craft
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to='/pages/care-guide'
                        className='text-gray-300 hover:text-brand-gold transition-colors duration-300'
                      >
                        Care Guide
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to='/pages/about-us'
                        className='text-gray-300 hover:text-brand-gold transition-colors duration-300'
                      >
                        About Us
                      </NavLink>
                    </li>
                  </ul>
                </div>

                {/* Policies Column */}
                <div className="space-y-6">
                  <h4 className="font-playFair text-lg">Polices</h4>
                  <FooterMenu
                    menu={ footer?.menu }
                    primaryDomainUrl={ header.shop.primaryDomain.url }
                    publicStoreDomain={ publicStoreDomain }
                  />
                </div>
              </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-white/10">
              <div className="container mx-auto px-4 py-6">
                <div className="space-y-4 md:space-y-0">
                  <p className="font-source text-sm text-center text-gray-400">
                    &copy; { new Date().getFullYear() } BASELINE. All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="space-y-3 font-source text-sm" role="navigation">
      {
        menu?.items.map((item) => {
          if (!item.url) return null;

          const url = item.url.includes("myshopify.com") ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

          return (
            <NavLink
              key={ item.id }
              className={({isActive}) => `black text-gray-300 hover:text-brand-gold transition-colors duration-300 ${ isActive ? 'text-brand-gold' : '' }`}
              end
              prefetch='intent'
              to={ url }
            >
              { item.title }
            </NavLink>
          )
        })
      }
    </nav>
  );
}
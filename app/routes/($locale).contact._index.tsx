import { Clock, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Submit actual form data to server & send emails
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { ok: true };
};

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type InquiryType = 'general' | 'bespoke';

const ContactPage = () => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [inquiryType, setInquiryType] = useState<InquiryType>('general');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState('submitting');

    try {
      setFormState('success');
    } catch (error) {
      setFormState('error');
    }
  }

  return (
    <>
    <div className="min-h-screen pt-24 md:pt-31">
      {/* Hero Section */}
      <section className="bg-brand-navy py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-playFair text-2xl md:text-3xl text-white mb-6">
              Connect With Us
            </h1>
            <p className="font-source text-lg text-brand-cream max-w-2xl mx-auto">
              Whether you're interested in a private consultation, bespoke services, or have questions about our collection, we're here to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 px-4 bg-brand-cream">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center py-8 px-8 bg-white">
              <MapPin className="w-6 h-6 text-brand-gold mx-auto mb-4" />
              <h3 className="font-playFair text-xl mb-3 text-brand-navy">
                Visit Us
              </h3>
              <p className="font-source text-brand-navy/70">
                123 Example Ave<br/>
                Forgettable Lane<br/>
                Some place 2000
              </p>
            </div>
            <div className="text-center py-8 px-8 bg-white">
              <Clock className="w-6 h-6 text-brand-gold mx-auto mb-4" />
              <h3 className="font-playFair text-xl mb-3 text-brand-navy">
                Working hours
              </h3>
              <p className="font-source text-brand-navy/70">
                Monday - Friday<br/>
                10:00 AM - 06:00 PM SAST<br/>
                Call any time
              </p>
            </div>
            <div className="text-center py-8 px-8 bg-white">
              <Clock className="w-6 h-6 text-brand-gold mx-auto mb-4" />
              <h3 className="font-playFair text-xl mb-3 text-brand-navy">
                Contact
              </h3>
              <p className="font-source text-brand-navy/70">
                email@example.com<br/>
                +27 123 456 7890<br/>
                Response within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center mb-12">
              <h2 className="font-playFair text-3xl md:text-4xl text-brand-navy mb-4">
                Get in Touch
              </h2>
              <p className="font-source text-brand-navy/70">
                We look forward to discussing how we can serve you
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <div className="grid grid-cols-2 gap-9">
                <button
                  type='button'
                  onClick={() => setInquiryType('general')}
                  className={`p-4 text-center font-source transition-colors ${inquiryType === 'general' ? 'bg-brand-navy text-white' : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10' }`}
                >
                  General Inquiry
                </button>
                <button
                  type='button'
                  onClick={() => setInquiryType('bespoke')}
                  className={`p-4 text-center font-source transition-colors ${inquiryType === 'general' ? 'bg-brand-navy text-white' : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10' }`}
                >
                  Bespoke Services
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-source text-sm text-[#1A2A3A]/70 mb-2">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source"
                  />
                </div>
                <div>
                  <label className="block font-source text-sm text-[#1A2A3A]/70 mb-2">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source"
                  />
                </div>
              </div>
              <div>
                <label className="block font-source text-sm text-[#1A2A3A]/70 mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full p-3 border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source"
                />
              </div>
              <div>
                <label className="block font-source text-sm text-[#1A2A3A]/70 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source"
                />
              </div>
              <div>
                <label className="block font-source text-sm text-[#1A2A3A]/70 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={ 5 }
                  className="w-full p-3 border border-[#1A2A3A]/20 focus:border-[#1A2A3A] outline-none transition-colors font-source"
                />
              </div>

              <button
                type='submit'
                disabled={ formState === 'submitting' }
                className="w-full bg-brand-navy text-white py-4 font-source tracking-wide hover:bg-brand-navyLight transition-colors disabled:bg-brand-navy/50"
              >
                { formState === 'submitting' ? 'Sending...' : 'Send Message' }
              </button>
              {
                formState === 'success' && (
                  <div className="text-brand-navy/70 text-center font-source">
                    Thank you for your message. We'll be in touch shortly.
                  </div>
                )
              }
              {
                formState === 'error' && (
                  <div className="text-red-600/70 text-center font-source">
                    There was an error sending your message. Please try again.
                  </div>
                )
              }
            </form>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ContactPage;
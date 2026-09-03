import {useFetcher} from 'react-router';

type NewsletterResult = {ok: true} | {ok: false; error: string};

export default function NewsletterForm() {
  const fetcher = useFetcher<NewsletterResult>();

  const isSubmitting = fetcher.state === 'submitting';
  const result = fetcher.data;

  return (
    <section className="border-b border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-playFair text-2xl mb-4">Join the Baseline Circle</h2>
          <p className='font-source text-sm text-gray-300 mb-6'>Subscribe to receive updates on new collections and exclusive offers</p>
          <fetcher.Form
            method="post"
            action="/newsletter"
            replace
            className="w-full flex flex-wrap justify-center gap-4"
          >
            <input
              type='email'
              placeholder='Your email Address'
              className='flex-1 px-4 py-3 bg-white/10 border-white/20 rounded-md text-white placeholder:text-gray-400 font-source'
              required
              name='email'
            />
            <button
              type='submit'
              className='w-max px-6 py-3 bg-brand-gold hover:bg-brand-goldDark transition-colors duration-300 rounded-md font-source'
            >
              Subscribe
            </button>
          </fetcher.Form>
        </div>
      </div>

      {result && !result.ok && (
        <p style={{color: 'red'}}>{result.error}</p>
      )}
      {result && result.ok && (
        <p>Thanks for subscribing!</p>
      )}
    </section>
  );
}
import { CartForm } from '@shopify/hydrogen';
import { X } from 'lucide-react';

type CartLineRemoveButtonProps = {
  lineIds: string[]
  disabled: boolean
};

export function CartLineRemoveButton (props: CartLineRemoveButtonProps) {
  const { lineIds, disabled } = props;

  return (
    <>
    <CartForm
      route='/cart'
      action={ CartForm.ACTIONS.LinesRemove }
      inputs={{ lineIds }}
    >
      <button
        disabled={ disabled }
        className={`ml-3 text-gray-400 hover:text-gray-500 transition-colors ${ disabled ? 'opacity-5- cursor-not-allowed' : ''}`}
      >
        <X className='w-4 h-4' />
      </button>
    </CartForm>
    </>
  );
};
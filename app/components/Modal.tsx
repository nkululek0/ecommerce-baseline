import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean
  closeModal: () => void
  children: React.ReactNode
  dynamicDimensions?: boolean
};


export function Modal (props: ModalProps) {
  const { open, closeModal, children, dynamicDimensions } = props;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setScrollY(window.scrollY);
    }
    else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <>
    {
      open && (
        <div
          aria-modal
          role="dialog"
          data-custom-modal
          className="w-[100dvw] h-[100dvh] absolute inset-0 z-50"
          style={{
            top: scrollY
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className={ `absolute top-[5%] left-[5%] h-[90%] w-[90%]  p-5 pb-0 bg-white shadow-xl` }
            style={ dynamicDimensions ? {
                maxWidth: '638px',
                width: 'auto',
                height: `max-content`,
                margin: 'auto',
                left: 'calc(25dvw / 4)',
                right: 'calc(25dvw / 4)',
                top: 'calc(25dvw / 4)',
                bottom: 'calc(25dvw / 4)',
              } : {}
            }
          >
            <div className='flex flex-row-reverse'>
              <button className='text-gray-400 hover:text-gray-500 transition-colors duration-300'>
                <X
                  className='w-5 h-5'
                  onClick={(event) => {
                    event.stopPropagation();
                    closeModal();
                  }}
                />
              </button>
            </div>
            <div className='w-full mt-1 mb-2 border-b border-gray-100'/>
            <div className='h-[inherit]'>
              { children }
            </div>
          </div>
        </div>
      )
    }
    </>
  );
};
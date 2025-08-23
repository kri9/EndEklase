import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
  const { isOpen, children, onClose } = props;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && <>
          <button
            onClick={onClose}
            className="relative top-2 left-2 text-gray-500 hover:text-gray-200 hover:bg-transparent text-xl font-bold"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </>}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};


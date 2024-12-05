import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
  const { isOpen, children } = props;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};


import { useState } from 'react';
import OrderModal from './OrderModal';

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  cover?: string;
}

export default function ProductCard({ title, description, price, cover }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-beige-100 hover:shadow-md transition-shadow flex flex-col">
        <div className="aspect-[4/3] bg-beige-100 relative overflow-hidden">
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-beige-200 to-beige-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-beige-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
          <p className="text-gray-500 text-sm flex-1 mb-4">{description}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-beige-700 font-semibold text-lg">{price} ₽</span>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-beige-700 text-white text-sm px-5 py-2 rounded-full hover:bg-beige-800 transition-colors"
            >
              Хочу получить
            </button>
          </div>
        </div>
      </div>
      <OrderModal
        productTitle={title}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

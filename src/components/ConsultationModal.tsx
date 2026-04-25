import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, telegram, message }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return createPortal(<div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Заявка отправлена!</h3>
            <p className="text-gray-500 mb-6">Я свяжусь с вами в ближайшее время.</p>
            <button
              onClick={onClose}
              className="bg-beige-700 text-white px-6 py-2 rounded-full hover:bg-beige-800 transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Записаться на консультацию</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Екатерина"
                  className="w-full border border-beige-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-beige-400 focus:ring-2 focus:ring-beige-200 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  required
                  placeholder="@username"
                  maxLength={64}
                  className="w-full border border-beige-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-beige-400 focus:ring-2 focus:ring-beige-200 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Краткое описание запроса{' '}
                  <span className="text-gray-400 font-normal">(необязательно)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Расскажите коротко, с чем хотите разобраться..."
                  rows={3}
                  className="w-full border border-beige-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-beige-400 focus:ring-2 focus:ring-beige-200 transition-colors resize-none"
                />
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm">Произошла ошибка. Попробуйте позже.</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-beige-700 text-white py-3 rounded-full font-medium hover:bg-beige-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? 'Отправка...' : 'Записаться'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>, document.body);
}

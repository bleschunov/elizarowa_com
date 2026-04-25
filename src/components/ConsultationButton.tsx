import { useState } from 'react';
import ConsultationModal from './ConsultationModal';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  buttonClass?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
};

export default function ConsultationButton({ size = 'md', buttonClass }: Props) {
  const [open, setOpen] = useState(false);

  const classes =
    buttonClass ??
    `bg-beige-700 text-white rounded-full font-medium hover:bg-beige-800 transition-colors ${sizeClasses[size]}`;

  return (
    <>
      <button onClick={() => setOpen(true)} className={classes}>
        Записаться
      </button>
      <ConsultationModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

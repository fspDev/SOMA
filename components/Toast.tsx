import React, { useEffect, useState } from 'react';
import { LightbulbIcon } from '../constants';

interface ToastProps {
  message: string;
  onClear: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClear }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before clearing the message
        setTimeout(onClear, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <div 
      className={`fixed bottom-6 left-6 px-5 py-3 bg-[#F0F0F0] text-[#18181B] rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center gap-3
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      role="alert"
      aria-live="assertive"
    >
      <LightbulbIcon className="w-5 h-5 text-[#18181B]" />
      <p className="font-semibold text-sm">{message}</p>
    </div>
  );
};

export default Toast;
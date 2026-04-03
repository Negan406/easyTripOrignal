import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const Notification = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-100',
      icon: faCheckCircle,
      iconColor: 'text-emerald-400'
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-100',
      icon: faExclamationCircle,
      iconColor: 'text-rose-400'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-100',
      icon: faInfoCircle,
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[4000] w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-500">
      <div className={`${config.bg} ${config.text} ${config.border} border rounded-[24px] p-4 shadow-2xl flex items-center gap-4 backdrop-blur-md bg-opacity-95`}>
        <FontAwesomeIcon icon={config.icon} className={`text-xl ${config.iconColor}`} />
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-0.5">{type}</p>
          <p className="text-sm font-bold leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Notification;
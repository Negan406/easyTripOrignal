import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faInfoCircle, faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";

const Notification = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: faCheckCircle,
      iconColor: 'text-emerald-500',
      progress: 'bg-emerald-400',
      label: 'Success'
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: faExclamationCircle,
      iconColor: 'text-rose-500',
      progress: 'bg-rose-400',
      label: 'Error'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: faExclamationTriangle,
      iconColor: 'text-amber-500',
      progress: 'bg-amber-400',
      label: 'Warning'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: faInfoCircle,
      iconColor: 'text-blue-500',
      progress: 'bg-blue-400',
      label: 'Info'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm sm:max-w-md pointer-events-auto">
      <div
        className={`${config.bg} ${config.text} border ${config.border} rounded-2xl shadow-2xl shadow-black/10 overflow-hidden`}
        style={{ animation: 'slideDownFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="flex items-start gap-3 p-4">
          <div className={`mt-0.5 shrink-0 text-xl ${config.iconColor}`}>
            <FontAwesomeIcon icon={config.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">{config.label}</p>
            <p className="text-sm font-semibold leading-relaxed break-words">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors opacity-60 hover:opacity-100"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-black/5">
          <div
            className={`h-full ${config.progress} opacity-50`}
            style={{ animation: `shrinkWidth ${duration}ms linear forwards` }}
          />
        </div>
      </div>
      <style>{`
        @keyframes slideDownFadeIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Notification;
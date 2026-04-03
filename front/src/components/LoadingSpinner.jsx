import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', color = 'text-blue-600', fullScreen = true }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-20 h-20 border-8'
  }[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
      <div className={`relative ${sizeClasses} border-gray-100 rounded-full`}>
        <div className={`absolute inset-0 ${sizeClasses} border-t-current rounded-full animate-spin ${color}`}></div>
        <div className={`absolute inset-0 ${sizeClasses} border-r-current rounded-full animate-spin-slow opacity-20 ${color}`}></div>
      </div>
      {fullScreen && (
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Loading</p>
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">EasyTrip Experience</p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-white/90 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default LoadingSpinner;
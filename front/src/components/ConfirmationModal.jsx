const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-[40px] p-10 max-w-sm w-full relative z-10 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-500 text-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Are you sure?</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-500/20"
          >
            Yes, Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
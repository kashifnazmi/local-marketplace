const EmptyState = ({ message = "Nothing to show here yet." }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <div className="text-5xl mb-3">🗂️</div>
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;

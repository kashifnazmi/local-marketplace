const DashboardCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-2xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

export default DashboardCard;

export default function RecordCard({ title, type, details }) {
  // Get appropriate icon and color based on record type
  const getTypeStyles = () => {
    switch(type) {
      case 'medication':
        return { icon: '💊', color: 'bg-blue-50 text-blue-600' };
      case 'allergy':
        return { icon: '⚠️', color: 'bg-red-50 text-red-600' };
      case 'condition':
        return { icon: '🏥', color: 'bg-purple-50 text-purple-600' };
      case 'lab-test':
        return { icon: '🔬', color: 'bg-green-50 text-green-600' };
      case 'visit':
        return { icon: '👨‍⚕️', color: 'bg-amber-50 text-amber-600' };
      default:
        return { icon: '📋', color: 'bg-gray-50 text-gray-600' };
    }
  };

  const { icon, color } = getTypeStyles();

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <span>{icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {details.map((item, index) => (
            <div key={index} className="text-sm">
              <p className="text-gray-500">{item.label}</p>
              <p className="font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-2">
          <button className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50">View Details</button>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronRight, FileMedical } from 'lucide-react';

export default function RecordCard({ record, type }) {
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon and color based on record type
  const getTypeStyle = () => {
    switch (type) {
      case 'medication':
        return {
          icon: <FileMedical className="h-5 w-5 text-blue-600" />,
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'allergy':
        return {
          icon: <FileMedical className="h-5 w-5 text-red-600" />,
          badge: 'bg-red-100 text-red-800'
        };
      case 'test':
        return {
          icon: <FileMedical className="h-5 w-5 text-purple-600" />,
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'condition':
        return {
          icon: <FileMedical className="h-5 w-5 text-amber-600" />,
          badge: 'bg-amber-100 text-amber-800'
        };
      default:
        return {
          icon: <FileMedical className="h-5 w-5 text-gray-600" />,
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const { icon, badge } = getTypeStyle();

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={badge}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                {formatDate(record.date)}
              </span>
            </div>
            
            <h3 className="text-lg font-medium leading-tight">{record.name || record.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{record.description}</p>
            
            {record.details && (
              <div className="mt-3 space-y-1">
                {Object.entries(record.details).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 text-sm">
                    <span className="text-gray-500 col-span-1">{key}</span>
                    <span className="col-span-2 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {icon}
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

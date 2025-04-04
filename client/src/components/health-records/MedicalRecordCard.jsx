import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileText, Download, ExternalLink } from 'lucide-react';

export default function MedicalRecordCard({ record, type }) {
  const getTypeStyle = () => {
    switch (type) {
      case 'prescription':
        return {
          icon: <FileText className="h-5 w-5 text-blue-600" />,
          color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        };
      case 'test':
        return {
          icon: <FileText className="h-5 w-5 text-purple-600" />,
          color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
        };
      case 'visit':
        return {
          icon: <FileText className="h-5 w-5 text-green-600" />,
          color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        };
      default:
        return {
          icon: <FileText className="h-5 w-5 text-gray-600" />,
          color: 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
        };
    }
  };
  
  const { icon, color } = getTypeStyle();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className={color}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                {formatDate(record.date)}
              </span>
            </div>
            <h3 className="font-medium text-lg">{record.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{record.description}</p>
          </div>
          {icon}
        </div>
        
        {record.details && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(record.details).map(([key, value]) => (
                <div key={key} className="col-span-2 sm:col-span-1">
                  <dt className="text-gray-500 dark:text-gray-400">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
        {record.downloadUrl && (
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
        )}
        <Button variant="outline" size="sm" className="text-xs">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Calculator, Zap } from 'lucide-react';

interface StatusBarProps {
  selectedCells: number;
  sum?: number;
  average?: number;
  count?: number;
}

export const StatusBar = ({ selectedCells, sum, average, count }: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between h-5 px-2 bg-excel-gray-100 border-t border-excel-gray-300 text-xs">
      <div className="flex items-center gap-4">
        <span className="text-excel-gray-600">Ready</span>
        
        {selectedCells > 1 && (
          <div className="flex items-center gap-3">
            {count !== undefined && (
              <span className="text-excel-gray-700">Count: {count}</span>
            )}
            {sum !== undefined && (
              <span className="text-excel-gray-700">Sum: {sum}</span>
            )}
            {average !== undefined && (
              <span className="text-excel-gray-700">Average: {average.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Calculator className="h-3 w-3 text-excel-gray-500" />
          <span className="text-excel-gray-600">Auto</span>
        </div>
        
        <div className="w-px h-3 bg-excel-gray-400" />
        
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-excel-gray-500" />
          <span className="text-excel-gray-600">100%</span>
        </div>
      </div>
    </div>
  );
};
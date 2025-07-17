import { Minimize2, Square, X } from 'lucide-react';
import { Button } from './ui/button';

export const TitleBar = () => {
  return (
    <div className="flex items-center justify-between h-8 bg-excel-green text-white px-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
          <span className="text-excel-green text-xs font-bold">X</span>
        </div>
        <span className="text-sm font-medium">Microsoft Excel</span>
      </div>
      
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-8 p-0 hover:bg-white/20 text-white"
        >
          <Minimize2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-8 p-0 hover:bg-white/20 text-white"
        >
          <Square className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-8 p-0 hover:bg-red-600 text-white"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
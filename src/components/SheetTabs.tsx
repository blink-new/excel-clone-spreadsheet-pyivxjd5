import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface Sheet {
  id: string;
  name: string;
  active: boolean;
}

interface SheetTabsProps {
  sheets: Sheet[];
  onSheetChange: (sheetId: string) => void;
  onAddSheet: () => void;
}

export const SheetTabs = ({ sheets, onSheetChange, onAddSheet }: SheetTabsProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <div className="flex items-center h-6 bg-excel-gray-100 border-t border-excel-gray-300">
      {/* Navigation Arrows */}
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-4 p-0 hover:bg-excel-gray-200"
          onClick={() => setScrollPosition(Math.max(0, scrollPosition - 1))}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-4 p-0 hover:bg-excel-gray-200"
          onClick={() => setScrollPosition(scrollPosition + 1)}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="w-px h-4 bg-excel-gray-400 mx-1" />

      {/* Sheet Tabs */}
      <div className="flex-1 flex overflow-hidden">
        {sheets.slice(scrollPosition).map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => onSheetChange(sheet.id)}
            className={`px-3 py-1 text-xs font-medium border-r border-excel-gray-300 whitespace-nowrap ${
              sheet.active
                ? 'bg-white text-excel-gray-900 border-t-2 border-t-excel-blue'
                : 'bg-excel-gray-100 text-excel-gray-700 hover:bg-excel-gray-200'
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Add Sheet Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddSheet}
        className="h-5 w-5 p-0 hover:bg-excel-gray-200 ml-1"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
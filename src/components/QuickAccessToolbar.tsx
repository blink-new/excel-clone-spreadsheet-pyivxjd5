import { Save, Undo, Redo, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface QuickAccessToolbarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const QuickAccessToolbar = ({ 
  onSave, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}: QuickAccessToolbarProps) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-excel-gray-50 border-b border-excel-gray-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        className="h-6 w-6 p-0 hover:bg-excel-gray-100"
      >
        <Save className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-6 w-6 p-0 hover:bg-excel-gray-100 disabled:opacity-50"
      >
        <Undo className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-6 w-6 p-0 hover:bg-excel-gray-100 disabled:opacity-50"
      >
        <Redo className="h-3 w-3" />
      </Button>
      
      <div className="w-px h-4 bg-excel-gray-300 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-excel-gray-100"
      >
        <FileText className="h-3 w-3" />
      </Button>
    </div>
  );
};
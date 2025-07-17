import { useState, useEffect } from 'react';
import { Check, X, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { getCellId } from '../utils/spreadsheet';

interface FormulaBarProps {
  activeCell: { row: number; col: number } | null;
  cellValue: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FormulaBar = ({
  activeCell,
  cellValue,
  onValueChange,
  onConfirm,
  onCancel
}: FormulaBarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(cellValue);

  useEffect(() => {
    setLocalValue(cellValue);
  }, [cellValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleConfirm = () => {
    onValueChange(localValue);
    onConfirm();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(cellValue);
    onCancel();
    setIsEditing(false);
  };

  const cellName = activeCell ? getCellId(activeCell.row, activeCell.col) : '';

  return (
    <div className="flex items-center h-6 bg-white border-b border-excel-gray-200">
      {/* Name Box */}
      <div className="flex items-center">
        <input
          type="text"
          value={cellName}
          readOnly
          className="w-16 h-5 px-2 text-xs border border-excel-gray-300 bg-white text-center font-medium"
        />
        <div className="w-px h-4 bg-excel-gray-300 mx-1" />
      </div>

      {/* Function Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-excel-gray-100 mr-1"
      >
        <Calculator className="h-3 w-3" />
      </Button>

      {/* Formula Input */}
      <div className="flex-1 flex items-center">
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleConfirm}
              className="h-5 w-5 p-0 hover:bg-excel-gray-100 mr-1"
            >
              <Check className="h-3 w-3 text-excel-green" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-5 w-5 p-0 hover:bg-excel-gray-100 mr-1"
            >
              <X className="h-3 w-3 text-red-500" />
            </Button>
          </>
        )}
        
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            if (isEditing) {
              handleConfirm();
            }
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 h-5 px-2 text-xs border-0 outline-none bg-transparent"
          placeholder="Enter formula or value..."
        />
      </div>
    </div>
  );
};
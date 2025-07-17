import { useState, useEffect, useRef, useCallback } from 'react';
import { Cell, Selection, CellStyle } from '../types/spreadsheet';
import { getCellId, columnToLetter, evaluateFormula } from '../utils/spreadsheet';

interface SpreadsheetGridProps {
  cells: { [key: string]: Cell };
  selection: Selection | null;
  activeCell: { row: number; col: number } | null;
  columnWidths: { [key: number]: number };
  rowHeights: { [key: number]: number };
  onCellChange: (row: number, col: number, value: string, formula?: string) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onActiveCellChange: (cell: { row: number; col: number } | null) => void;
  onColumnResize: (col: number, width: number) => void;
}

const ROWS = 100;
const COLS = 26;
const DEFAULT_CELL_WIDTH = 80;
const DEFAULT_CELL_HEIGHT = 20;
const HEADER_HEIGHT = 20;

export const SpreadsheetGrid = ({
  cells,
  selection,
  activeCell,
  columnWidths,
  rowHeights,
  onCellChange,
  onSelectionChange,
  onActiveCellChange,
  onColumnResize
}: SpreadsheetGridProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const cellId = getCellId(row, col);
    const cell = cells[cellId];
    const style: React.CSSProperties = {
      width: columnWidths[col] || DEFAULT_CELL_WIDTH,
      height: rowHeights[row] || DEFAULT_CELL_HEIGHT,
      minWidth: columnWidths[col] || DEFAULT_CELL_WIDTH,
      minHeight: rowHeights[row] || DEFAULT_CELL_HEIGHT,
    };

    if (cell?.style) {
      if (cell.style.bold) style.fontWeight = 'bold';
      if (cell.style.italic) style.fontStyle = 'italic';
      if (cell.style.fontSize) style.fontSize = `${cell.style.fontSize}px`;
      if (cell.style.fontColor) style.color = cell.style.fontColor;
      if (cell.style.backgroundColor) style.backgroundColor = cell.style.backgroundColor;
      if (cell.style.textAlign) style.textAlign = cell.style.textAlign;
    }

    // Selection highlighting
    if (selection && 
        row >= selection.startRow && row <= selection.endRow &&
        col >= selection.startCol && col <= selection.endCol) {
      style.backgroundColor = style.backgroundColor || '#e3f2fd';
      style.border = '1px solid #2196f3';
    }

    // Active cell highlighting
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      style.border = '2px solid #217346';
      style.zIndex = 1;
    }

    return style;
  };

  const getCellValue = (row: number, col: number): string => {
    const cellId = getCellId(row, col);
    const cell = cells[cellId];
    
    if (!cell) return '';
    
    if (cell.formula) {
      return evaluateFormula(cell.formula, cells);
    }
    
    return cell.value;
  };

  const handleCellClick = (row: number, col: number, event: React.MouseEvent) => {
    if (isEditing) {
      commitEdit();
    }

    if (event.shiftKey && activeCell) {
      // Extend selection
      const newSelection: Selection = {
        startRow: Math.min(activeCell.row, row),
        startCol: Math.min(activeCell.col, col),
        endRow: Math.max(activeCell.row, row),
        endCol: Math.max(activeCell.col, col)
      };
      onSelectionChange(newSelection);
    } else {
      // Single cell selection
      onActiveCellChange({ row, col });
      onSelectionChange({ startRow: row, startCol: col, endRow: row, endCol: col });
    }
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    const cellId = getCellId(row, col);
    const cell = cells[cellId];
    setEditValue(cell?.formula || cell?.value || '');
    setIsEditing(true);
    onActiveCellChange({ row, col });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing) {
      if (event.key === 'Enter') {
        commitEdit();
        moveActiveCell(1, 0);
      } else if (event.key === 'Escape') {
        cancelEdit();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        commitEdit();
        moveActiveCell(0, event.shiftKey ? -1 : 1);
      }
      return;
    }

    if (!activeCell) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveActiveCell(-1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveActiveCell(1, 0);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveActiveCell(0, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveActiveCell(0, 1);
        break;
      case 'Enter':
        event.preventDefault();
        moveActiveCell(1, 0);
        break;
      case 'Tab':
        event.preventDefault();
        moveActiveCell(0, event.shiftKey ? -1 : 1);
        break;
      case 'Delete':
      case 'Backspace':
        if (activeCell) {
          onCellChange(activeCell.row, activeCell.col, '');
        }
        break;
      case 'F2':
        event.preventDefault();
        startEdit();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          startEdit(event.key);
        }
    }
  };

  const moveActiveCell = (deltaRow: number, deltaCol: number) => {
    if (!activeCell) return;
    
    const newRow = Math.max(0, Math.min(ROWS - 1, activeCell.row + deltaRow));
    const newCol = Math.max(0, Math.min(COLS - 1, activeCell.col + deltaCol));
    
    onActiveCellChange({ row: newRow, col: newCol });
    onSelectionChange({ startRow: newRow, startCol: newCol, endRow: newRow, endCol: newCol });
  };

  const startEdit = (initialValue?: string) => {
    if (!activeCell) return;
    
    const cellId = getCellId(activeCell.row, activeCell.col);
    const cell = cells[cellId];
    setEditValue(initialValue || cell?.formula || cell?.value || '');
    setIsEditing(true);
  };

  const commitEdit = () => {
    if (!activeCell) return;
    
    const isFormula = editValue.startsWith('=');
    onCellChange(activeCell.row, activeCell.col, editValue, isFormula ? editValue : undefined);
    setIsEditing(false);
    setEditValue('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleMouseDown = (row: number, col: number, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click
    
    setIsDragging(true);
    setDragStart({ row, col });
    handleCellClick(row, col, event);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging || !dragStart) return;
    
    const newSelection: Selection = {
      startRow: Math.min(dragStart.row, row),
      startCol: Math.min(dragStart.col, col),
      endRow: Math.max(dragStart.row, row),
      endCol: Math.max(dragStart.col, col)
    };
    onSelectionChange(newSelection);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleColumnHeaderMouseDown = (col: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isNearRightEdge = event.clientX > rect.right - 5;
    
    if (isNearRightEdge) {
      setResizingColumn(col);
      setResizeStartX(event.clientX);
      setResizeStartWidth(columnWidths[col] || DEFAULT_CELL_WIDTH);
      event.preventDefault();
    }
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (resizingColumn !== null) {
      const deltaX = event.clientX - resizeStartX;
      const newWidth = Math.max(20, resizeStartWidth + deltaX);
      onColumnResize(resizingColumn, newWidth);
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth, onColumnResize]);

  const handleGlobalMouseUp = useCallback(() => {
    setResizingColumn(null);
    handleMouseUp();
  }, []);

  useEffect(() => {
    if (resizingColumn !== null || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [resizingColumn, isDragging, handleMouseMove, handleGlobalMouseUp]);

  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto bg-white"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative">
        {/* Column Headers */}
        <div className="flex sticky top-0 z-10 bg-excel-gray-100 border-b border-excel-gray-300">
          <div className="w-10 h-5 border-r border-excel-gray-300 bg-excel-gray-200" />
          {Array.from({ length: COLS }, (_, col) => (
            <div
              key={col}
              className="flex items-center justify-center text-xs font-medium border-r border-excel-gray-300 bg-excel-gray-100 hover:bg-excel-gray-200 cursor-pointer relative"
              style={{ 
                width: columnWidths[col] || DEFAULT_CELL_WIDTH,
                height: HEADER_HEIGHT,
                minWidth: columnWidths[col] || DEFAULT_CELL_WIDTH
              }}
              onMouseDown={(e) => handleColumnHeaderMouseDown(col, e)}
            >
              {columnToLetter(col)}
              <div 
                className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-excel-blue"
                style={{ marginRight: '-2px' }}
              />
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex">
            {/* Row Header */}
            <div className="w-10 flex items-center justify-center text-xs font-medium border-r border-b border-excel-gray-300 bg-excel-gray-100 hover:bg-excel-gray-200 cursor-pointer sticky left-0 z-10"
                 style={{ height: rowHeights[row] || DEFAULT_CELL_HEIGHT }}>
              {row + 1}
            </div>
            
            {/* Row Cells */}
            {Array.from({ length: COLS }, (_, col) => {
              const cellId = getCellId(row, col);
              const isActiveCell = activeCell?.row === row && activeCell?.col === col;
              const isEditingThisCell = isEditing && isActiveCell;
              
              return (
                <div
                  key={col}
                  className="border-r border-b border-excel-gray-300 relative flex items-center px-1 cursor-cell hover:bg-excel-gray-50"
                  style={getCellStyle(row, col)}
                  onClick={(e) => handleCellClick(row, col, e)}
                  onDoubleClick={() => handleCellDoubleClick(row, col)}
                  onMouseDown={(e) => handleMouseDown(row, col, e)}
                  onMouseEnter={() => handleMouseEnter(row, col)}
                >
                  {isEditingThisCell ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-full border-0 outline-none bg-transparent text-xs"
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        handleKeyDown(e);
                      }}
                    />
                  ) : (
                    <span className="text-xs truncate w-full">
                      {getCellValue(row, col)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
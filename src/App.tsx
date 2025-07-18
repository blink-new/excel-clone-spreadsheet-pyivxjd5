import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { QuickAccessToolbar } from './components/QuickAccessToolbar';
import { Ribbon } from './components/Ribbon';
import { FormulaBar } from './components/FormulaBar';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { SheetTabs } from './components/SheetTabs';
import { StatusBar } from './components/StatusBar';
import { Cell, Selection, SpreadsheetState, RibbonTab } from './types/spreadsheet';
import { getCellId, evaluateFormula } from './utils/spreadsheet';
import { Toaster, toast } from 'react-hot-toast';

const initialState: SpreadsheetState = {
  cells: {},
  selection: null,
  activeCell: { row: 0, col: 0 },
  columnWidths: {},
  rowHeights: {},
  history: [],
  historyIndex: -1
};

const initialSheets = [
  { id: 'sheet1', name: 'Sheet1', active: true },
  { id: 'sheet2', name: 'Sheet2', active: false },
  { id: 'sheet3', name: 'Sheet3', active: false }
];

function App() {
  const [state, setState] = useState<SpreadsheetState>(initialState);
  const [activeTab, setActiveTab] = useState<RibbonTab>('Home');
  const [sheets, setSheets] = useState(initialSheets);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [clipboard, setClipboard] = useState<{ cells: Cell[]; selection: Selection } | null>(null);
  const [fontSize, setFontSize] = useState(11);

  // Update formula bar when active cell changes
  useEffect(() => {
    if (state.activeCell) {
      const cellId = getCellId(state.activeCell.row, state.activeCell.col);
      const cell = state.cells[cellId];
      setFormulaBarValue(cell?.formula || cell?.value || '');
    }
  }, [state.activeCell, state.cells]);

  const saveToHistory = useCallback((newState: SpreadsheetState) => {
    const history = newState.history.slice(0, newState.historyIndex + 1);
    history.push({ ...newState, history: [], historyIndex: -1 });
    
    return {
      ...newState,
      history: history.slice(-50), // Keep last 50 states
      historyIndex: Math.min(history.length - 1, 49)
    };
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: string, formula?: string) => {
    setState(prevState => {
      const cellId = getCellId(row, col);
      const newCells = { ...prevState.cells };
      
      if (value === '' && !formula) {
        delete newCells[cellId];
      } else {
        newCells[cellId] = {
          id: cellId,
          value,
          formula,
          row,
          col,
          style: prevState.cells[cellId]?.style
        };
      }
      
      const newState = {
        ...prevState,
        cells: newCells
      };
      
      return saveToHistory(newState);
    });
  }, [saveToHistory]);

  const handleSelectionChange = useCallback((selection: Selection | null) => {
    setState(prevState => ({
      ...prevState,
      selection
    }));
  }, []);

  const handleActiveCellChange = useCallback((cell: { row: number; col: number } | null) => {
    setState(prevState => ({
      ...prevState,
      activeCell: cell
    }));
  }, []);

  const handleColumnResize = useCallback((col: number, width: number) => {
    setState(prevState => ({
      ...prevState,
      columnWidths: {
        ...prevState.columnWidths,
        [col]: width
      }
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex > 0) {
        const previousState = prevState.history[prevState.historyIndex - 1];
        return {
          ...previousState,
          history: prevState.history,
          historyIndex: prevState.historyIndex - 1
        };
      }
      return prevState;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex < prevState.history.length - 1) {
        const nextState = prevState.history[prevState.historyIndex + 1];
        return {
          ...nextState,
          history: prevState.history,
          historyIndex: prevState.historyIndex + 1
        };
      }
      return prevState;
    });
  }, []);

  const handleSave = useCallback(() => {
    // In a real app, this would save to a backend
    localStorage.setItem('excel-clone-data', JSON.stringify(state));
    toast.success('Spreadsheet saved successfully!');
  }, [state]);

  const handleFormatBold = useCallback(() => {
    if (!state.activeCell) return;
    
    setState(prevState => {
      const cellId = getCellId(state.activeCell!.row, state.activeCell!.col);
      const cell = prevState.cells[cellId] || {
        id: cellId,
        value: '',
        row: state.activeCell!.row,
        col: state.activeCell!.col
      };
      
      const newCells = {
        ...prevState.cells,
        [cellId]: {
          ...cell,
          style: {
            ...cell.style,
            bold: !cell.style?.bold
          }
        }
      };
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
  }, [state.activeCell, saveToHistory]);

  const handleFormatItalic = useCallback(() => {
    if (!state.activeCell) return;
    
    setState(prevState => {
      const cellId = getCellId(state.activeCell!.row, state.activeCell!.col);
      const cell = prevState.cells[cellId] || {
        id: cellId,
        value: '',
        row: state.activeCell!.row,
        col: state.activeCell!.col
      };
      
      const newCells = {
        ...prevState.cells,
        [cellId]: {
          ...cell,
          style: {
            ...cell.style,
            italic: !cell.style?.italic
          }
        }
      };
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
  }, [state.activeCell, saveToHistory]);

  const handleFormatUnderline = useCallback(() => {
    if (!state.activeCell) return;
    
    setState(prevState => {
      const cellId = getCellId(state.activeCell!.row, state.activeCell!.col);
      const cell = prevState.cells[cellId] || {
        id: cellId,
        value: '',
        row: state.activeCell!.row,
        col: state.activeCell!.col
      };
      
      const newCells = {
        ...prevState.cells,
        [cellId]: {
          ...cell,
          style: {
            ...cell.style,
            underline: !cell.style?.underline
          }
        }
      };
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
  }, [state.activeCell, saveToHistory]);

  const handleAlign = useCallback((alignment: 'left' | 'center' | 'right') => {
    if (!state.activeCell) return;
    
    setState(prevState => {
      const cellId = getCellId(state.activeCell!.row, state.activeCell!.col);
      const cell = prevState.cells[cellId] || {
        id: cellId,
        value: '',
        row: state.activeCell!.row,
        col: state.activeCell!.col
      };
      
      const newCells = {
        ...prevState.cells,
        [cellId]: {
          ...cell,
          style: {
            ...cell.style,
            textAlign: alignment
          }
        }
      };
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
  }, [state.activeCell, saveToHistory]);

  const handleFontSizeChange = useCallback((delta: number) => {
    if (!state.activeCell) return;
    
    const newFontSize = Math.max(8, Math.min(72, fontSize + delta));
    setFontSize(newFontSize);
    
    setState(prevState => {
      const cellId = getCellId(state.activeCell!.row, state.activeCell!.col);
      const cell = prevState.cells[cellId] || {
        id: cellId,
        value: '',
        row: state.activeCell!.row,
        col: state.activeCell!.col
      };
      
      const newCells = {
        ...prevState.cells,
        [cellId]: {
          ...cell,
          style: {
            ...cell.style,
            fontSize: newFontSize
          }
        }
      };
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
  }, [state.activeCell, fontSize, saveToHistory]);

  const handleCopy = useCallback(() => {
    if (!state.selection) return;
    
    const copiedCells: Cell[] = [];
    for (let row = state.selection.startRow; row <= state.selection.endRow; row++) {
      for (let col = state.selection.startCol; col <= state.selection.endCol; col++) {
        const cellId = getCellId(row, col);
        const cell = state.cells[cellId];
        if (cell) {
          copiedCells.push({ ...cell });
        }
      }
    }
    
    setClipboard({ cells: copiedCells, selection: state.selection });
    toast.success('Copied to clipboard');
  }, [state.selection, state.cells]);

  const handlePaste = useCallback(() => {
    if (!clipboard || !state.activeCell) return;
    
    setState(prevState => {
      const newCells = { ...prevState.cells };
      const offsetRow = state.activeCell!.row - clipboard.selection.startRow;
      const offsetCol = state.activeCell!.col - clipboard.selection.startCol;
      
      clipboard.cells.forEach(cell => {
        const newRow = cell.row + offsetRow;
        const newCol = cell.col + offsetCol;
        const newCellId = getCellId(newRow, newCol);
        
        newCells[newCellId] = {
          ...cell,
          id: newCellId,
          row: newRow,
          col: newCol
        };
      });
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
    
    toast.success('Pasted from clipboard');
  }, [clipboard, state.activeCell, saveToHistory]);

  const handleCut = useCallback(() => {
    if (!state.selection) return;
    
    const copiedCells: Cell[] = [];
    for (let row = state.selection.startRow; row <= state.selection.endRow; row++) {
      for (let col = state.selection.startCol; col <= state.selection.endCol; col++) {
        const cellId = getCellId(row, col);
        const cell = state.cells[cellId];
        if (cell) {
          copiedCells.push({ ...cell });
        }
      }
    }
    
    setClipboard({ cells: copiedCells, selection: state.selection });
    
    // Delete the cut cells
    setState(prevState => {
      const newCells = { ...prevState.cells };
      for (let row = state.selection!.startRow; row <= state.selection!.endRow; row++) {
        for (let col = state.selection!.startCol; col <= state.selection!.endCol; col++) {
          const cellId = getCellId(row, col);
          delete newCells[cellId];
        }
      }
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
    
    toast.success('Cut to clipboard');
  }, [state.selection, state.cells, saveToHistory]);

  const handleDelete = useCallback(() => {
    if (!state.selection) return;
    
    setState(prevState => {
      const newCells = { ...prevState.cells };
      for (let row = state.selection!.startRow; row <= state.selection!.endRow; row++) {
        for (let col = state.selection!.startCol; col <= state.selection!.endCol; col++) {
          const cellId = getCellId(row, col);
          delete newCells[cellId];
        }
      }
      
      return saveToHistory({
        ...prevState,
        cells: newCells
      });
    });
    
    toast.success('Deleted selected cells');
  }, [state.selection, saveToHistory]);

  const handleSheetChange = useCallback((sheetId: string) => {
    setSheets(prevSheets => 
      prevSheets.map(sheet => ({
        ...sheet,
        active: sheet.id === sheetId
      }))
    );
  }, []);

  const handleAddSheet = useCallback(() => {
    const newSheetNumber = sheets.length + 1;
    const newSheet = {
      id: `sheet${newSheetNumber}`,
      name: `Sheet${newSheetNumber}`,
      active: false
    };
    setSheets(prevSheets => [...prevSheets, newSheet]);
  }, [sheets.length]);

  const handleFormulaBarChange = useCallback((value: string) => {
    setFormulaBarValue(value);
  }, []);

  const handleFormulaBarConfirm = useCallback(() => {
    if (state.activeCell) {
      const isFormula = formulaBarValue.startsWith('=');
      handleCellChange(
        state.activeCell.row, 
        state.activeCell.col, 
        formulaBarValue, 
        isFormula ? formulaBarValue : undefined
      );
    }
  }, [state.activeCell, formulaBarValue, handleCellChange]);

  const handleFormulaBarCancel = useCallback(() => {
    if (state.activeCell) {
      const cellId = getCellId(state.activeCell.row, state.activeCell.col);
      const cell = state.cells[cellId];
      setFormulaBarValue(cell?.formula || cell?.value || '');
    }
  }, [state.activeCell, state.cells]);

  // Calculate status bar statistics
  const getSelectionStats = () => {
    if (!state.selection) return { selectedCells: 1 };
    
    let sum = 0;
    let count = 0;
    let numericCount = 0;
    
    for (let row = state.selection.startRow; row <= state.selection.endRow; row++) {
      for (let col = state.selection.startCol; col <= state.selection.endCol; col++) {
        const cellId = getCellId(row, col);
        const cell = state.cells[cellId];
        
        if (cell && cell.value.trim() !== '') {
          count++;
          const value = cell.formula ? evaluateFormula(cell.formula, state.cells) : cell.value;
          const num = parseFloat(value);
          if (!isNaN(num)) {
            sum += num;
            numericCount++;
          }
        }
      }
    }
    
    const selectedCells = (state.selection.endRow - state.selection.startRow + 1) * 
                         (state.selection.endCol - state.selection.startCol + 1);
    
    return {
      selectedCells,
      sum: numericCount > 0 ? sum : undefined,
      average: numericCount > 0 ? sum / numericCount : undefined,
      count: count > 0 ? count : undefined
    };
  };

  const stats = getSelectionStats();

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('excel-clone-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setState(parsedData);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'x':
            e.preventDefault();
            handleCut();
            break;
          case 'b':
            e.preventDefault();
            handleFormatBold();
            break;
          case 'i':
            e.preventDefault();
            handleFormatItalic();
            break;
          case 'u':
            e.preventDefault();
            handleFormatUnderline();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, handleCopy, handlePaste, handleCut, handleFormatBold, handleFormatItalic, handleFormatUnderline]);

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      <TitleBar />
      
      <QuickAccessToolbar
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
      />
      
      <Ribbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFormatBold={handleFormatBold}
        onFormatItalic={handleFormatItalic}
        onFormatUnderline={handleFormatUnderline}
        onAlignLeft={() => handleAlign('left')}
        onAlignCenter={() => handleAlign('center')}
        onAlignRight={() => handleAlign('right')}
        onFontSizeIncrease={() => handleFontSizeChange(1)}
        onFontSizeDecrease={() => handleFontSizeChange(-1)}
        fontSize={fontSize}
        onCopy={handleCopy}
        onPaste={handlePaste}
      />
      
      <FormulaBar
        activeCell={state.activeCell}
        cellValue={formulaBarValue}
        onValueChange={handleFormulaBarChange}
        onConfirm={handleFormulaBarConfirm}
        onCancel={handleFormulaBarCancel}
      />
      
      <SpreadsheetGrid
        cells={state.cells}
        selection={state.selection}
        activeCell={state.activeCell}
        columnWidths={state.columnWidths}
        rowHeights={state.rowHeights}
        onCellChange={handleCellChange}
        onSelectionChange={handleSelectionChange}
        onActiveCellChange={handleActiveCellChange}
        onColumnResize={handleColumnResize}
      />
      
      <SheetTabs
        sheets={sheets}
        onSheetChange={handleSheetChange}
        onAddSheet={handleAddSheet}
      />
      
      <StatusBar {...stats} />
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
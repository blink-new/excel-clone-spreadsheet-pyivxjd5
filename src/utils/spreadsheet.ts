import { Cell } from '../types/spreadsheet';

export const columnToLetter = (col: number): string => {
  let result = '';
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
  }
  return result;
};

export const letterToColumn = (letter: string): number => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
};

export const getCellId = (row: number, col: number): string => {
  return `${columnToLetter(col)}${row + 1}`;
};

export const parseCellId = (cellId: string): { row: number; col: number } => {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell ID: ${cellId}`);
  
  const col = letterToColumn(match[1]);
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
};

export const evaluateFormula = (formula: string, cells: { [key: string]: Cell }): string => {
  if (!formula.startsWith('=')) return formula;
  
  const expression = formula.slice(1);
  
  // Handle basic functions
  if (expression.startsWith('SUM(')) {
    const range = expression.slice(4, -1);
    return evaluateSum(range, cells).toString();
  }
  
  if (expression.startsWith('AVERAGE(')) {
    const range = expression.slice(8, -1);
    return evaluateAverage(range, cells).toString();
  }
  
  if (expression.startsWith('COUNT(')) {
    const range = expression.slice(6, -1);
    return evaluateCount(range, cells).toString();
  }
  
  if (expression.startsWith('MAX(')) {
    const range = expression.slice(4, -1);
    return evaluateMax(range, cells).toString();
  }
  
  if (expression.startsWith('MIN(')) {
    const range = expression.slice(4, -1);
    return evaluateMin(range, cells).toString();
  }
  
  if (expression.startsWith('IF(')) {
    const args = expression.slice(3, -1);
    return evaluateIf(args, cells);
  }
  
  // Handle cell references
  const cellRefRegex = /[A-Z]+\d+/g;
  let result = expression;
  const matches = expression.match(cellRefRegex);
  
  if (matches) {
    matches.forEach(cellRef => {
      const cell = cells[cellRef];
      const value = cell ? (cell.formula ? evaluateFormula(cell.formula, cells) : cell.value) : '0';
      result = result.replace(cellRef, value || '0');
    });
  }
  
  try {
    // Basic arithmetic evaluation
    return eval(result).toString();
  } catch {
    return '#ERROR!';
  }
};

const evaluateSum = (range: string, cells: { [key: string]: Cell }): number => {
  const cellRefs = parseRange(range);
  let sum = 0;
  
  cellRefs.forEach(cellRef => {
    const cell = cells[cellRef];
    if (cell) {
      const value = cell.formula ? evaluateFormula(cell.formula, cells) : cell.value;
      const num = parseFloat(value);
      if (!isNaN(num)) sum += num;
    }
  });
  
  return sum;
};

const evaluateAverage = (range: string, cells: { [key: string]: Cell }): number => {
  const cellRefs = parseRange(range);
  let sum = 0;
  let count = 0;
  
  cellRefs.forEach(cellRef => {
    const cell = cells[cellRef];
    if (cell) {
      const value = cell.formula ? evaluateFormula(cell.formula, cells) : cell.value;
      const num = parseFloat(value);
      if (!isNaN(num)) {
        sum += num;
        count++;
      }
    }
  });
  
  return count > 0 ? sum / count : 0;
};

const evaluateCount = (range: string, cells: { [key: string]: Cell }): number => {
  const cellRefs = parseRange(range);
  let count = 0;
  
  cellRefs.forEach(cellRef => {
    const cell = cells[cellRef];
    if (cell && cell.value.trim() !== '') {
      count++;
    }
  });
  
  return count;
};

const evaluateMax = (range: string, cells: { [key: string]: Cell }): number => {
  const cellRefs = parseRange(range);
  let max = -Infinity;
  let hasValue = false;
  
  cellRefs.forEach(cellRef => {
    const cell = cells[cellRef];
    if (cell) {
      const value = cell.formula ? evaluateFormula(cell.formula, cells) : cell.value;
      const num = parseFloat(value);
      if (!isNaN(num)) {
        max = Math.max(max, num);
        hasValue = true;
      }
    }
  });
  
  return hasValue ? max : 0;
};

const evaluateMin = (range: string, cells: { [key: string]: Cell }): number => {
  const cellRefs = parseRange(range);
  let min = Infinity;
  let hasValue = false;
  
  cellRefs.forEach(cellRef => {
    const cell = cells[cellRef];
    if (cell) {
      const value = cell.formula ? evaluateFormula(cell.formula, cells) : cell.value;
      const num = parseFloat(value);
      if (!isNaN(num)) {
        min = Math.min(min, num);
        hasValue = true;
      }
    }
  });
  
  return hasValue ? min : 0;
};

const evaluateIf = (args: string, cells: { [key: string]: Cell }): string => {
  try {
    // Simple IF function: IF(condition, value_if_true, value_if_false)
    const parts = args.split(',').map(part => part.trim());
    if (parts.length !== 3) return '#ERROR!';
    
    const [condition, trueValue, falseValue] = parts;
    
    // Replace cell references in condition
    const cellRefRegex = /[A-Z]+\d+/g;
    let evaluatedCondition = condition;
    const matches = condition.match(cellRefRegex);
    
    if (matches) {
      matches.forEach(cellRef => {
        const cell = cells[cellRef];
        const value = cell ? (cell.formula ? evaluateFormula(cell.formula, cells) : cell.value) : '0';
        evaluatedCondition = evaluatedCondition.replace(cellRef, value || '0');
      });
    }
    
    // Evaluate condition
    const result = eval(evaluatedCondition);
    return result ? trueValue.replace(/"/g, '') : falseValue.replace(/"/g, '');
  } catch {
    return '#ERROR!';
  }
};

const parseRange = (range: string): string[] => {
  if (range.includes(':')) {
    const [start, end] = range.split(':');
    const startPos = parseCellId(start);
    const endPos = parseCellId(end);
    
    const cellRefs: string[] = [];
    for (let row = startPos.row; row <= endPos.row; row++) {
      for (let col = startPos.col; col <= endPos.col; col++) {
        cellRefs.push(getCellId(row, col));
      }
    }
    return cellRefs;
  }
  
  return [range];
};
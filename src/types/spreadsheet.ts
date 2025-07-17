export interface Cell {
  id: string;
  value: string;
  formula?: string;
  style?: CellStyle;
  row: number;
  col: number;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface SpreadsheetState {
  cells: { [key: string]: Cell };
  selection: Selection | null;
  activeCell: { row: number; col: number } | null;
  columnWidths: { [key: number]: number };
  rowHeights: { [key: number]: number };
  history: SpreadsheetState[];
  historyIndex: number;
}

export type RibbonTab = 'Home' | 'Insert' | 'Page Layout' | 'Formulas' | 'Data' | 'Review' | 'View';
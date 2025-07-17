import { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  Plus,
  Minus,
  Copy,
  Clipboard
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { RibbonTab } from '../types/spreadsheet';

interface RibbonProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  onFormatBold: () => void;
  onFormatItalic: () => void;
  onFormatUnderline: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  fontSize: number;
  onCopy: () => void;
  onPaste: () => void;
}

const tabs: RibbonTab[] = ['Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];

export const Ribbon = ({
  activeTab,
  onTabChange,
  onFormatBold,
  onFormatItalic,
  onFormatUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onFontSizeIncrease,
  onFontSizeDecrease,
  fontSize,
  onCopy,
  onPaste
}: RibbonProps) => {
  return (
    <div className="bg-excel-gray-50 border-b border-excel-gray-200">
      {/* Tab Headers */}
      <div className="flex border-b border-excel-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-excel-blue text-excel-blue bg-white'
                : 'border-transparent text-excel-gray-700 hover:text-excel-gray-900 hover:bg-excel-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-2">
        {activeTab === 'Home' && (
          <div className="flex items-center gap-2">
            {/* Clipboard Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Copy (Ctrl+C)"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPaste}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Paste (Ctrl+V)"
              >
                <Clipboard className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Font Group */}
            <div className="flex items-center gap-1">
              <select className="px-2 py-1 text-sm border border-excel-gray-300 rounded">
                <option>Segoe UI</option>
                <option>Arial</option>
                <option>Times New Roman</option>
              </select>
              
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFontSizeDecrease}
                  className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                  title="Decrease font size"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <input 
                  type="text" 
                  value={fontSize} 
                  readOnly
                  className="w-8 h-6 text-xs text-center border border-excel-gray-300"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFontSizeIncrease}
                  className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                  title="Increase font size"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Format Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onFormatBold}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFormatItalic}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFormatUnderline}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Alignment Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignLeft}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Align left"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignCenter}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Align center"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignRight}
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Align right"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Color Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Font color"
              >
                <Type className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-excel-gray-100"
                title="Fill color"
              >
                <Palette className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {activeTab !== 'Home' && (
          <div className="h-8 flex items-center text-sm text-excel-gray-500">
            {activeTab} tab content coming soon...
          </div>
        )}
      </div>
    </div>
  );
};
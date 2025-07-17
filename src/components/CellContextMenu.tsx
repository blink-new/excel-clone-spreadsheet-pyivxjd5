import { useEffect, useState } from 'react';
import { Copy, Clipboard, Scissors, Trash2 } from 'lucide-react';

interface CellContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onDelete: () => void;
  canPaste: boolean;
}

export const CellContextMenu = ({
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onCut,
  onDelete,
  canPaste
}: CellContextMenuProps) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      label: 'Copy',
      icon: Copy,
      onClick: onCopy,
      shortcut: 'Ctrl+C',
      disabled: false
    },
    {
      label: 'Cut',
      icon: Scissors,
      onClick: onCut,
      shortcut: 'Ctrl+X',
      disabled: false
    },
    {
      label: 'Paste',
      icon: Clipboard,
      onClick: onPaste,
      shortcut: 'Ctrl+V',
      disabled: !canPaste
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      shortcut: 'Delete',
      disabled: false
    }
  ];

  return (
    <div
      className="fixed bg-white border border-excel-gray-300 rounded shadow-lg py-1 z-50 min-w-32"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-excel-gray-100 flex items-center gap-2 ${
            item.disabled ? 'text-excel-gray-400 cursor-not-allowed' : 'text-excel-gray-700'
          }`}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
        >
          <item.icon className="h-3 w-3" />
          <span className="flex-1">{item.label}</span>
          <span className="text-xs text-excel-gray-500">{item.shortcut}</span>
        </button>
      ))}
    </div>
  );
};
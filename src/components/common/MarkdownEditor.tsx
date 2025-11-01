import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit3, Bold, Italic, Link, List, Code, Quote } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your description...",
  className = ""
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  // const [cursorPosition, setCursorPosition] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState(300);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;
      if (newHeight > 100 && newHeight < 800) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handlePaste = () => {
    // Let the default paste behavior handle everything
    // This prevents any automatic URL conversion that might be causing issues
    return;
  };


  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      case 'list':
        insertText('- ');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'quote':
        insertText('> ');
        break;
    }
  };


  return (
    <div 
      ref={containerRef}
      className={`border border-gray-300 rounded-lg overflow-hidden flex flex-col ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText('link')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText('list')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText('code')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatText('quote')}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              mode === 'edit' 
                ? 'bg-gray-200 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="w-4 h-4 mr-1.5 inline" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              mode === 'preview' 
                ? 'bg-gray-200 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-1.5 inline" />
            Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full h-full p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed overflow-y-auto"
            style={{ lineHeight: '1.6' }}
          />
        ) : (
          <div className="h-full overflow-y-auto bg-white p-4">
            <MarkdownRenderer content={value || 'Nothing to preview'} />
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="h-2 bg-gray-200 hover:bg-gray-300 cursor-ns-resize flex items-center justify-center flex-shrink-0"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-8 h-0.5 bg-gray-400 rounded"></div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

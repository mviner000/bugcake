// components/NumberedTextarea.tsx
import React, { useRef, useEffect } from 'react';

interface NumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const NumberedTextarea: React.FC<NumberedTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 4
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const lines = value.split('\n');
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  const syncScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    syncScroll();
  }, [value]);

  return (
    <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
      {/* Line numbers */}
      <div 
        className="flex flex-col items-end px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-500 text-sm select-none"
        style={{ minWidth: '40px' }}
      >
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6 h-6">
            {num}.
          </div>
        ))}
      </div>
      
      {/* Textarea with hidden numbers */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 ${className}`}
          style={{ 
            fontFamily: 'monospace',
            lineHeight: '1.5rem'
          }}
        />
      </div>
    </div>
  );
};
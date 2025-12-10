

import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  isRegNo?: boolean; // If true, enforces uppercase and spacing between letters/numbers
  isTitleCase?: boolean; // If true, enforces Title Case (e.g. John Doe, Lusaka)
  readOnly?: boolean; // If true, input is disabled and cannot be changed
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ 
  label, value, onChange, options = [], placeholder, isRegNo, isTitleCase, readOnly
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter(opt => 
    opt && opt.toLowerCase().includes(value.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    let newVal = e.target.value;
    
    // Auto-formatting for Registration Numbers
    // Rule: Uppercase + Space between Letters and Numbers
    if (isRegNo) {
        // 1. Force Uppercase
        newVal = newVal.toUpperCase();
        
        // 2. Remove existing non-alphanumeric chars to process raw string
        let raw = newVal.replace(/[^A-Z0-9]/g, '');

        // 3. Logic: Insert space whenever a Letter is followed by a Number
        // e.g. "AHB1502" -> "AHB 1502"
        raw = raw.replace(/([A-Z])(\d)/g, '$1 $2');
        
        // 4. Logic: Insert space whenever a Number is followed by a Letter
        // e.g. "1502ZM" -> "1502 ZM"
        raw = raw.replace(/(\d)([A-Z])/g, '$1 $2');

        newVal = raw;
    }

    // Auto-formatting for Title Case (Names, Locations)
    if (isTitleCase && !isRegNo) {
        // Capitalize first letter of every word, lowercase the rest (smart typing)
        // actually for typing, we just capitalize the first letter of words to allow user flexibility
        newVal = newVal.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    onChange(newVal);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: string) => {
    if (readOnly) return;
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        // Allow selecting the current text as the value (Add New Entry)
        handleSelect(value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide flex justify-between">
          {label}
          {readOnly && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Verified
              </span>
          )}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => !readOnly && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full p-3.5 border rounded-lg transition-all font-medium 
             ${readOnly 
               ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed focus:outline-none' 
               : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-800 placeholder-gray-400'
             }
          `}
        />
        {/* Icon based on state */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            {readOnly ? (
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            ) : (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            )}
        </div>
      </div>

      {!readOnly && isOpen && (value.length > 0 || filteredOptions.length > 0) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-none flex justify-between items-center
                  ${idx === highlightedIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                {opt}
                {isRegNo && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">EXISTING</span>}
              </li>
            ))
          ) : (
             <li 
                onMouseDown={(e) => {
                    // Prevent blur from firing before click
                    e.preventDefault(); 
                    handleSelect(value);
                }}
                className="px-4 py-3 text-sm text-blue-600 bg-blue-50 cursor-pointer font-medium flex items-center gap-2 hover:bg-blue-100 transition-colors"
             >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Add New Entry: "{value}"
             </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
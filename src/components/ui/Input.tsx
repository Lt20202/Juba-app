
import React from 'react';

const Input: React.FC<{label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string}> = ({label, value, onChange, type='text', placeholder}) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-medium placeholder-gray-400" 
    />
  </div>
);

export default Input;

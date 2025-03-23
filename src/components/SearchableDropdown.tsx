import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchableDropdownProps<T extends Record<string, unknown>> {
  options: T[];
  label: keyof T; // Propiedad a mostrar en la lista
  id: keyof T; // Propiedad única del objeto
  filterBy: keyof T; // Propiedad para filtrar
  selectedVal: string | number;
  handleChange: (value: string | number) => void;
  placeholder?: string;
  required: boolean;
}

const SearchableDropdown = <T extends Record<string, unknown>>({
  options,
  label,
  id,
  filterBy,
  selectedVal,
  handleChange,
  placeholder = 'Buscar...',
  required,
}: SearchableDropdownProps<T>) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedVal) {
      const selectedOption = options.find(option => option[id] === selectedVal);
      if (selectedOption) {
        setQuery(String(selectedOption[label]));
      }
    }
  }, [selectedVal, options, id, label]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtra las opciones según la propiedad filterBy
  const filteredOptions = options.filter(option => {
    const value = option[filterBy];
    return (
      typeof value === 'string' &&
      value.toLowerCase().includes(query.toLowerCase())
    );
  });

  // Maneja la selección de una opción
  const handleSelectOption = (option: T) => {
    handleChange(option[id] as string | number);
    setQuery(String(option[label]));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(e.target.value !== '');
        }}
        placeholder={placeholder}
        className="w-full"
        required={required}
      />
      {isOpen && (
        <ScrollArea className="absolute max-h-32 overflow-y-auto z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={String(option[id]) + index}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectOption(option)}
              >
                {String(option[label])}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchableDropdown;

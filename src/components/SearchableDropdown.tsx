// "use client"

// import { useState, useCallback, useMemo, useRef } from "react";

// interface SearchableDropdownProps {
//   options: { [key: string]: string }[];
//   label: string;
//   id: string;
//   selectedVal: string | null;
//   handleChange: (value: string | null) => void;
//   placeholder?: string;
// }

// const SearchableDropdown = ({
//   options,
//   label,
//   id,
//   selectedVal,
//   handleChange,
//   placeholder,
// }: SearchableDropdownProps) => {
//   const [query, setQuery] = useState<string>("");
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   const inputRef = useRef<HTMLInputElement>(null);

//   const toggle = useCallback((e: MouseEvent) => {
//     if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
//       setIsOpen(false);
//     }
//   }, []);

//   const selectOption = useCallback(
//     (option: { [key: string]: string }) => {
//       setQuery("");
//       handleChange(option[label]);
//       setIsOpen(false);
//     },
//     [handleChange, label]
//   );

//   const getDisplayValue = useMemo(() => {
//     if (query) return query;
//     if (selectedVal) return selectedVal;
//     return "";
//   }, [query, selectedVal]);

//   const filteredOptions = useMemo(() => {
//     return options.filter((option) =>
//       option[label].toLowerCase().includes(query.toLowerCase())
//     );
//   }, [options, query, label]);

//   return (
//     <div className="dropdown">
//       <div className="control">
//       <div className="selected-value">
//         <input
//         ref={inputRef}
//         type="text"
//         value={getDisplayValue}
//         name="searchTerm"
//         placeholder={placeholder}
//         onChange={(e) => {
//           setQuery(e.target.value);
//           handleChange(null);
//         }}
//         onClick={() => setIsOpen((prev) => !prev)}
//         />
//       </div>
//       <div className={`arrow ${isOpen ? "open" : ""}`} />
//       </div>

//       {isOpen && (
//       <div className="options">
//         {filteredOptions.map((option, index) => (
//         <div
//           key={`${id}-${index}`}
//           className={`option ${option[label] === selectedVal ? "selected" : ""}`}
//           onClick={() => selectOption(option)}
//         >
//           {option[label]}
//         </div>
//         ))}
//       </div>
//       )}
//     </div>
//   );
// };

// export default SearchableDropdown;
import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import {ScrollArea} from "@/components/ui/scroll-area"

interface Option {
  [key: string]: any
}

interface SearchableDropdownProps {
  options: Option[]
  label: string
  id: string
  selectedVal: string | number
  handleChange: (value: string) => void
  placeholder?: string
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  label,
  id,
  selectedVal,
  handleChange,
  placeholder = "Buscar..."
}) => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter((option) =>
    option[label].toLowerCase().includes(query.toLowerCase())
  )

  const handleSelectOption = (option: Option) => {
    handleChange(option[id].toString())
    setQuery(option[label])
    setIsOpen(false)
  }

  return (
    <div className={`${!isOpen ? "pb-32" : ""}`} ref={dropdownRef}>
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full"
      />
      {isOpen && (
        <ScrollArea className="absolute max-h-32 overflow-y-auto z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option[id]}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectOption(option)}
              >
                {option.initials}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No se encontraron resultados</div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}

export default SearchableDropdown


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
  filterBy: string
  selectedVal: string | number
  handleChange: (value: string) => void
  placeholder?: string
  required: boolean
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  label,
  id,
  filterBy,
  selectedVal,
  handleChange,
  placeholder = "Buscar...",
  required
}) => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedVal) {
      setQuery(selectedVal.toString())  
    }
  }, [])

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
    option[filterBy].toLowerCase().includes(query.toLowerCase())
  )

  const handleSelectOption = (option: Option) => {
    handleChange(option[id].toString())
    setQuery(option[label])
    setIsOpen(false)
  }


  return (
    <div className="absolute" ref={dropdownRef}>
      
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value !== "")
            setIsOpen(true)
          else
            setIsOpen(false)
        }}
        placeholder={placeholder}
        className="w-full"
        required={required}
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


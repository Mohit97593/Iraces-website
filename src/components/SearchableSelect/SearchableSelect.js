import React, { useState, useEffect, useRef } from 'react';
import './SearchableSelect.css';

const SearchableSelect = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Select...',
    name,
    className = '',
    disabled = false,
    required = false,
    searchable = true
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const containerRef = useRef(null);

    // Sync search term with value prop
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // Filter options based on search term (only if searchable)
    useEffect(() => {
        if (!searchable || !searchTerm) {
            setFilteredOptions(options);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = options.filter(opt => {
                const label = (opt.label || opt.name || opt).toString().toLowerCase();
                return label.includes(lowerSearch);
            });
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, searchable]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search term to current value if no selection was made
                setSearchTerm(value);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleInputChange = (e) => {
        if (!searchable) return;
        const newVal = e.target.value;
        setSearchTerm(newVal);
        setIsOpen(true);

        // We notify the parent of the manual text entry too
        // This allows the parent to handle it as it wish (e.g., if they want to allow manual typing)
        if (onChange) {
            onChange({ target: { name, value: newVal } });
        }
    };

    const handleOptionClick = (opt) => {
        const selectedValue = opt.label || opt.name || opt;
        setSearchTerm(selectedValue);
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { name, value: selectedValue } });
        }
    };

    return (
        <div className={`searchable-select-container ${className}`} ref={containerRef}>
            <input
                type="text"
                name={name}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                readOnly={!searchable}
                className={`form-control3 searchable-select-input ${!searchable ? 'non-searchable' : ''}`}
                autoComplete="off"
                style={{ cursor: !searchable && !disabled ? 'pointer' : 'text' }}
            />
            <div className={`searchable-select-dropdown ${isOpen ? 'show' : ''}`}>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt, idx) => (
                        <div
                            key={idx}
                            className="searchable-select-item"
                            onClick={() => handleOptionClick(opt)}
                        >
                            {opt.label || opt.name || opt}
                        </div>
                    ))
                ) : (
                    <div className="searchable-select-no-results">No results found</div>
                )}
            </div>
        </div>
    );
};

export default SearchableSelect;

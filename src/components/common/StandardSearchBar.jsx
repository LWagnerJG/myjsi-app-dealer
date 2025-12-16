import React from 'react';
import { SearchInput } from './SearchInput.jsx';

// Standardized 56px pill search used across feature screens (matches Orders / AppHeader styling)
// Props: value, onChange (event or value), placeholder, theme, className, onVoiceClick, id
export const StandardSearchBar = ({ value, onChange, placeholder='Search...', theme, className='', onVoiceClick, id }) => {
  const handleChange = (val) => {
    // SearchInput passes the value directly (not an event)
    // Accept both value and event handlers for flexibility
    if (onChange) {
      if (typeof val === 'string') {
        onChange(val);
      } else if (val?.target) {
        onChange(val.target.value);
      } else {
        onChange(val);
      }
    }
  };
  return (
    <SearchInput
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      theme={theme}
      variant="header"
      className={className}
      inputClassName=""
    />
  );
};

export default StandardSearchBar;

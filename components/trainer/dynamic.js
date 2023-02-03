import React, { useState } from 'react';
import styles from '../../styles/forms.module.css';
function DynamicForm() {
  const [inputs, setInputs] = useState([
    { type: 'text', placeholder: 'Enter text here...' },
    { type: 'password', placeholder: 'Enter password...' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Button 1', name: 'radio' },
    { type: 'radio', label: 'Radio Button 2', name: 'radio' },
    {
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    { type: 'textarea', placeholder: 'Enter text here...' },
  ]);

  const handleAddInput = (type) => {
    let input = {};
    switch (type) {
      case 'text':
        input = { type: 'text', placeholder: 'Enter text here...' };
        break;
      case 'password':
        input = { type: 'password', placeholder: 'Enter password...' };
        break;
      case 'checkbox':
        input = { type: 'checkbox', label: 'Checkbox' };
        break;
      case 'radio':
        input = { type: 'radio', label: 'Radio Button', name: 'radio' };
        break;
      case 'select':
        input = {
          type: 'select',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        };
        break;
      case 'textarea':
        input = { type: 'textarea', placeholder: 'Enter text here...' };
        break;
      default:
        input = { type: 'text', placeholder: 'Enter text here...' };
    }
    setInputs([...inputs, input]);
  };

  const handleChange = (e, index) => {
    // Update the value of the input field at the specified index
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], value: e.target.value };
    setInputs(newInputs);
  };

  const handleCheckboxChange = (e, index) => {
    // Update the value of the checkbox at the specified index
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], checked: e.target.checked };
    setInputs(newInputs);
  };

  const handleRadioChange = (e, index) => {
    // Update the value of the radio button at the specified index
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], checked: e.target.checked };
    setInputs(newInputs);
  };

  const handleSelectChange = (e, index) => {
    // Update the value of the select field at the specified index
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], value: e.target.value };
    setInputs(newInputs);
  };

  return (
    <form className={styles.dynamic}>
      {inputs.map((input, index) => {
        switch (input.type) {
          case 'text':
          case 'password':
            return (
              <input
                key={index}
                type={input.type}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) => handleChange(e, index)}
              />
            );
          case 'checkbox':
            return (
              <label key={index}>
                <input
                  type={input.type}
                  checked={input.checked}
                  onChange={(e) => handleCheckboxChange(e, index)}
                />
                {input.label}
              </label>
            );
          case 'radio':
            return (
              <label key={index}>
                <input
                  type={input.type}
                  name={input.name}
                  checked={input.checked}
                  onChange={(e) => handleRadioChange(e, index)}
                />
                {input.label}
              </label>
            );
          case 'select':
            return (
              <select
                key={index}
                value={input.value}
                onChange={(e) => handleSelectChange(e, index)}
              >
                {input.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          case 'textarea':
            return (
              <textarea
                key={index}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) => handleChange(e, index)}
              />
            );
          default:
            return null;
        }
      })}
      <button type='button' onClick={() => handleAddInput('text')}>
        Add Text Input
      </button>
      <button type='button' onClick={() => handleAddInput('password')}>
        Add Password Input
      </button>
      <button type='button' onClick={() => handleAddInput('checkbox')}>
        Add Checkbox
      </button>
      <button type='button' onClick={() => handleAddInput('radio')}>
        Add Radio Button
      </button>
      <button type='button' onClick={() => handleAddInput('select')}>
        Add Select
      </button>
      <button type='button' onClick={() => handleAddInput('textarea')}>
        Add Text Area
      </button>
    </form>
  );
}

export default DynamicForm;

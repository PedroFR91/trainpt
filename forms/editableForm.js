import React, { useState } from 'react';

function Form() {
  const [inputs, setInputs] = useState([{ type: 'text', value: '' }]);
  const [options, setOptions] = useState(['Opción 1', 'Opción 2', 'Opción 3']);
  const [view, setView] = useState(false);

  const handleInputChange = (e, index) => {
    const newInputs = [...inputs];
    newInputs[index].value = e.target.value;
    setInputs(newInputs);
  };

  const handleSelectChange = (e, index) => {
    const newInputs = [...inputs];
    newInputs[index].type = e.target.value;
    setInputs(newInputs);
    if (e.target.value === 'select') {
      setView(true);
    } else {
      setView(false);
    }
  };

  const handleAddInput = () => {
    setInputs([...inputs, { type: 'text', value: '' }]);
    setOptions(['Opción 1', 'Opción 2', 'Opción 3']);
    setView(false);
  };

  const handleRemoveInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const handleOptionChange = (e, index) => {
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    setOptions(newOptions);
    console.log(options);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  return (
    <form>
      {inputs.map((input, index) => (
        <div key={index}>
          <select
            value={input.type}
            onChange={(e) => handleSelectChange(e, index)}
          >
            <option value='text'>Texto</option>
            <option value='file'>Archivo</option>
            <option value='select'>Selección</option>
          </select>
          {input.type === 'text' && (
            <input
              type='text'
              value={input.value}
              onChange={(e) => handleInputChange(e, index)}
            />
          )}
          {input.type === 'file' && (
            <input type='file' onChange={(e) => handleInputChange(e, index)} />
          )}
          {input.type === 'select' && (
            <select onChange={(e) => handleInputChange(e, index)}>
              {options.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
          <button type='button' onClick={() => handleRemoveInput(index)}>
            Eliminar entrada
          </button>
        </div>
      ))}
      <button type='button' onClick={handleAddInput}>
        Añadir entrada
      </button>
      {view && (
        <>
          <hr />
          <h3>Opciones del select:</h3>
          {options.map((option, index) => (
            <div key={index}>
              <input
                type='text'
                value={option}
                onChange={(e) => handleOptionChange(e, index)}
              />
              <button type='button' onClick={() => handleRemoveOption(index)}>
                Eliminar opción
              </button>
            </div>
          ))}
          <button type='button' onClick={handleAddOption}>
            Añadir opción
          </button>
        </>
      )}
    </form>
  );
}

export default Form;

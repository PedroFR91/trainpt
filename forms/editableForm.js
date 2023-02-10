import React, { useState } from 'react';

const editableForm = () => {
  const [formEntries, setFormEntries] = useState([
    {
      id: 1,
      label: 'Nombre',
      type: 'text',
      value: '',
    },
    {
      id: 2,
      label: 'Edad',
      type: 'number',
      value: '',
    },
    {
      id: 3,
      label: 'Género',
      type: 'select',
      options: [
        { value: 'Hombre', label: 'Hombre' },
        { value: 'Mujer', label: 'Mujer' },
      ],
    },
  ]);
  const [entryData, setEntryData] = useState({
    id: 0,
    label: '',
    type: 'text',
    value: '',
    options: [{}],
  });

  const [selectedEntryIndex, setSelectedEntryIndex] = useState(-1);
  const inputTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'select', label: 'Seleción Múltiple' },
    { value: 'file', label: 'Archivo' },
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEntryData({ ...entryData, [name]: value });
  };

  const handleAddEntry = () => {
    const newEntry = {
      id: formEntries.length + 1,
      ...entryData,
    };
    setFormEntries([...formEntries, newEntry]);
    setEntryData({
      id: 0,
      label: '',
      type: entryData.type,
      value: '',
      options: [{}],
    });
  };

  const handleEditEntry = () => {
    const updatedFormEntries = formEntries.map((formEntry, index) => {
      if (index === selectedEntryIndex) {
        return entryData;
      }
      return formEntry;
    });
    setFormEntries(updatedFormEntries);
    setSelectedEntryIndex(-1);
    setEntryData({
      id: 0,
      label: '',
      type: entryData.type,
      value: '',
      options: [{}],
    });
  };

  const handleDeleteEntry = () => {
    const updatedFormEntries = formEntries.filter(
      (formEntry, index) => index !== selectedEntryIndex
    );
    setFormEntries(updatedFormEntries);
    setSelectedEntryIndex(-1);
    setEntryData({
      id: 0,
      label: '',
      type: entryData.type,
      value: '',
      options: [{}],
    });
  };

  const handleEntrySelect = (index) => {
    setSelectedEntryIndex(index);
    setEntryData(formEntries[index]);
  };

  return (
    <div>
      <h2>Formulario Personalizado</h2>
      <ul>
        {formEntries.map((formEntry, index) => (
          <li key={formEntry.id}>
            {formEntry.type !== 'select' ? (
              <div style={{ display: 'flex' }}>
                <p>{formEntry.label}</p>
                <input type={formEntry.type} />
                <button onClick={() => handleEntrySelect(index)}>Edit</button>
              </div>
            ) : (
              <div style={{ display: 'flex' }}>
                <p>{formEntry.label}</p>
                <select>
                  {formEntry.options.map((data, i) => (
                    <option key={i} value={data.value}>
                      {data.value}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleEntrySelect(index)}>Edit</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <h2>Añadir / Editar Entrada</h2>
      <div>
        <label htmlFor='label'>Nombre del Campo:</label>
        <input
          type='text'
          name='label'
          value={entryData.label}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor='type'>Tipo:</label>
        <select name='type' value={entryData.type} onChange={handleInputChange}>
          {inputTypes.map((inputType) => (
            <option key={inputType.value} value={inputType.value}>
              {inputType.label}
            </option>
          ))}
        </select>
      </div>
      {entryData.type === 'select' && (
        <div>
          <label htmlFor='options'>Options:</label>
          <input
            type='text'
            name='options'
            value={
              typeof entryData.options === 'string'
                ? entryData.options
                    .split(',')
                    .map((option) => option.trim())
                    .join(', ')
                : entryData.options
            }
            onChange={handleInputChange}
            placeholder='Enter options separated by comma'
          />
        </div>
      )}
      {entryData.type === 'file' && (
        <div>
          <label htmlFor='file'>File:</label>
          <input type='file' name='file' onChange={handleInputChange} />
        </div>
      )}
      <div>
        {selectedEntryIndex === -1 ? (
          <button onClick={handleAddEntry}>Add Entry</button>
        ) : (
          <>
            <button onClick={handleEditEntry}>Save Changes</button>
            <button onClick={handleDeleteEntry}>Delete Entry</button>
          </>
        )}
      </div>
    </div>
  );
};

export default editableForm;

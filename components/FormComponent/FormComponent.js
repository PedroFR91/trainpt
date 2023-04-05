import React from 'react';

const FormComponent = ({ inputs, onChange }) => {
  return (
    <div>
      {inputs.map((input, index) => (
        <div key={index}>
          <label htmlFor={input.name}>{input.label}</label>
          <input
            type={input.type}
            name={input.name}
            value={input.value}
            onChange={onChange}
            required={input.required}
          />
        </div>
      ))}
    </div>
  );
};

export default FormComponent;

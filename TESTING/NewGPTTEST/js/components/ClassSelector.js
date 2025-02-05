import React from 'react';

const ClassSelector = ({ selectedClass, setSelectedClass, disabled }) => {
  const classes = ['Light', 'Medium', 'Heavy', 'Random'];

  return (
    <div className="class-selector">
      <div className={`step-indicator ${selectedClass ? 'active' : ''}`}>
        Step 2️⃣: Pick your contestant
      </div>
      
      <div className="class-buttons">
        {classes.map((classType) => (
          <button
            key={classType}
            onClick={() => setSelectedClass(classType)}
            disabled={disabled}
            className={`
              class-btn
              ${selectedClass === classType ? 'active' : ''}
              ${disabled ? 'disabled' : ''}
              ${classType === 'Random' ? 'random' : ''}
            `}
          >
            {classType === 'Random' ? '?' : classType}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassSelector;
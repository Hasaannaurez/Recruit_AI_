import React from 'react'
import {useState} from 'react'
import '../../CssFiles/PhaseInput.css'

const PhaseInput = ({addPhase}) => {
    const [input, setInput] = useState('');

    const handleAddPhase = () => {
      const trimmedInput = input.trim();
      if(!trimmedInput) return; // Prevent adding empty phases
        addPhase(trimmedInput);
        setInput('');
    }

    const handleKeyDown = (e) => {
      if(e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        handleAddPhase();
      }
    }
  return (
    <div className='PhaseInputContainer'>
        <input
            type='text'
            placeholder='Add a phase'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown ={handleKeyDown} //if we press enter it will add the phase via handleaddekey function
        />
        <button type="button" onClick={handleAddPhase} >Add Phase</button>
    </div>
  )
}

export default PhaseInput
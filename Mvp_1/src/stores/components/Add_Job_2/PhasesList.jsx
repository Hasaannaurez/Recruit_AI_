import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Phase from './Phase.jsx';

const PhasesList = ({ phases, removePhase }) => {
    return (
        <div className="form-group">
            <h2>Phases: </h2>
            <h4>(Create, Drag and Delete the phases to match your desired sequence).</h4>
            <ul>
                <SortableContext items={phases} strategy={verticalListSortingStrategy}>
                    {phases.map((phase, index) => (
                        <li key={phase}><Phase id={phase} phase={phase} removePhase={removePhase} /></li>
                    ))}
                </SortableContext>
            </ul>
        </div>
    );
};

export default PhasesList;
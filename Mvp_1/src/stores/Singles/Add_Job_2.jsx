import React, { useState, useEffect  } from 'react';
import Navbar_Home from '../components/Navbar_Home';
import PhasesList from '../components/Add_Job_2/PhasesList.jsx';  // Import new component
import '../CssFiles/Add_Job_2.css';
import { getRequest, postRequest } from '../../utils/apiclient.jsx';
import {DndContext, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, closestCorners, useSensors, useSensor} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import PhaseInput from '../components/Add_Job_2/PhaseInput.jsx';
import Swal from 'sweetalert2';

const Add_Job_2 = ({id, onComplete}) => {
    const [jobData, setJobData] = useState({
        location: '',
        Salary: '',
        phase: ["new_applicant","Inreview", "Interview", "Offered", "Hired", "Rejected"],
        job_id: id,
        Onsite: {
            country: '',
            State: '',
            city: '',
            postal_code: '',
        },
        interviewRounds: '',
        candidates_required: '',
    });

const addPhase = phase => {
    setJobData((prevState) => ({
        ...prevState,
        phase: [...prevState.phase, phase],
    }));
}

const removephase = (phasetoRemove) => {
    setJobData(prevData => ({
        ...prevData,
        phase: prevData.phase.filter(phase => phase !== phasetoRemove)
    }))
}

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(MouseSensor),
        useSensor(TouchSensor)
    )

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if(active.id!==over.id){
            const activeIndex = jobData.phase.indexOf(active.id);
            const overIndex = jobData.phase.indexOf(over.id);
            const newphases = [...jobData.phase];
            newphases.splice(activeIndex, 1);
            newphases.splice(overIndex, 0, active.id);
            setJobData((prevState) => ({
                ...prevState,
                phase: newphases,
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert interviewRounds to a number
        const numRounds = parseInt(jobData.interviewRounds, 10) || 0;

        // Modify "Interview" phase dynamically based on number of rounds
        let interviewPhase = "Interview"; // Default
        if (numRounds >= 1) {
            interviewPhase = ["Interview", ...Array.from({ length: numRounds }, (_, i) => `Round ${i + 1}`)];
        }

        // Construct updated Phase array
        const updatedPhase = jobData.phase.map(phase => 
            phase === "Interview" ? interviewPhase : phase
        );

        // Construct the final job data to send to backend
        const jobDataToSend = {
            ...jobData,
            phase: updatedPhase,  // Store interview rounds inside "Interview"
        };

        console.log("Sending to backend:", jobDataToSend);

        try {

            const response = await postRequest('job/save_2nd_form/', jobDataToSend );
            console.log(response);
            if (response.status === 200) {
               Swal.fire({
                                     title: "Role Added Succesfully",
                                     icon: "success",
                                     toast: true,
                                     timer: 2400,
                                     position: 'top-right',
                                     timerProgressBar: true,
                                     showConfirmButton: false,
                           });
               onComplete();
            }
            
        } catch (error) {
            console.log(error);
        }

        // Here you can make an API call to send data to the backend
        // Example: axios.post("/api/add-job", jobDataToSend)
        
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "country" || name === "State" || name === "city" || name === "postal_code") {
            setJobData((prevState) => ({
                ...prevState,
                Onsite: {
                    ...prevState.Onsite,
                    [name]: value,
                }
            }));
        } else {
            setJobData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    return (
        <div>
            
                <>
                    <Navbar_Home />
                    <div className="add-job-container">
                        <div className="header">
                            <h1>Some more Data</h1>
                        </div>
    
                        <div className="role-form-container">
                            <form className="role-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <h2>Role salary</h2>
                                    <input
                                        type="text"
                                        name="Salary"
                                        value={jobData.Salary}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter role Salary"
                                    />
                                </div>
                               
                               <div className="form-group">
                                    <h2>Candidates Required</h2>
                                    <input
                                        type="text"
                                        name="candidates_required"
                                        value={jobData.candidates_required}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter candidates required"
                                    />
                                </div>

                                <div className="form-group">
                                    <h2>Role Location</h2>
                                    <select
                                        className="form-input"
                                        name="location"
                                        value={jobData.location}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Onsite">Onsite</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                      
                                {jobData.location === 'Onsite' && (
                                    <>
                                        <div className="form-group">
                                            <h2>Country</h2>
                                            <input
                                                type="text"
                                                name="country"
                                                value={jobData.Onsite.country}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="Enter Country"
                                            />
                                        </div>
    
                                        <div className="form-group">
                                            <h2>State</h2>
                                            <input
                                                type="text"
                                                name="State"
                                                value={jobData.Onsite.State}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="Enter State"
                                            />
                                        </div>
    
                                        <div className="form-group">
                                            <h2>City</h2>
                                            <input
                                                type="text"
                                                name="city"
                                                value={jobData.Onsite.city}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="Enter city"
                                            />
                                        </div>
    
                                        <div className="form-group">
                                            <h2>Postal Code</h2>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={jobData.Onsite.postal_code}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="Enter postal code"
                                            />
                                        </div>
                                    </>
                                )}
                               <DndContext sensors= {sensors} 
                               onDragEnd = {handleDragEnd} collisionDetection = {closestCorners}>
                                <PhasesList phases={jobData.phase} removePhase={removephase} />
                                <PhaseInput addPhase={addPhase} />
                                </DndContext>

                                <div className="form-group">
                                    <h2>Number of Interview Rounds</h2>
                                    <input
                                        type="text"
                                        name="interviewRounds"
                                        value={jobData.interviewRounds}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter number of interview rounds"
                                    />
                                </div>
    
                                <button type="submit" className="submit-btn">
                                    Add Role
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            
        </div>
    );
};

export default Add_Job_2;

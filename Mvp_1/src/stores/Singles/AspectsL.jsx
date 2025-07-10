import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { postRequest, getRequest } from '../../utils/apiclient';
import "../CssFiles/aspects.css";
import Navbar_Home from '../components/Navbar_Home';
import { useParams } from 'react-router-dom';

const AspectsL = () => {

    const {id} = useParams();

  const [overall, setOverall] = useState([]);
  const [editableOverall, setEditableOverall] = useState([]);

  const [allPara, setallPara] = useState([]);
  const [groupAspects, setGroupAspects] = useState({});
  const [editableGroupAspects, setEditableGroupAspects] = useState({});

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGroup, setShowGroup] = useState(false);
  const [showOverall, setShowOverall] = useState(false);
  const [showParameters, setShowParameters] = useState(true);
  const [showNewPara, setShowNewPara] = useState(false);
  
  // New states for dropdown functionality
  const [showDropdown, setShowDropdown] = useState({ n: false, e: false, d: false });
  const [addingParameter, setAddingParameter] = useState({ n: null, e: null, d: null });
  const [addGroupParameter, setAddGroupParameter] = useState({});
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  const intervalRef = useRef(null);

  const fetchAspects = async () => {
    try {
      const overallResponse = await getRequest(`a/get_job_aspects/${id}`);
      setOverall(overallResponse.overall_score);
      setEditableOverall(overallResponse.overall_score);
      setGroupAspects(overallResponse.group_aspects);
      setEditableGroupAspects(JSON.parse(JSON.stringify(overallResponse.group_aspects)));
      setallPara(overallResponse.aspects_all_parameters);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkProcessingStatus();
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [id]);

  const checkProcessingStatus = async () => {
    try {
      const response = await getRequest(`a/get_aspects_status/${id}/`);
      if (response.Status === "completed") {
        setLoading(false);
        clearInterval(intervalRef.current);
       fetchAspects();
      } else {
        setLoading(true);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleAllDisplay = ({ category }) => {
    setShowParameters(category === "parameters");
    setShowOverall(category === "overall");
    setShowGroup(category === "group");
  };

  const saveEditedOverall = async () => {
    try {
      await postRequest(`a/edit_overall_parameters/${id}/`, editableOverall);
      setOverall(editableOverall);
      setIsEditingOverall(false);
    } catch (err) {
      console.error("Failed to save overall parameters:", err);
    }
  };

  const saveEditedGroupAspects = async () => {
    try {
      await postRequest(`a/edit_group_aspects/${id}/`, editableGroupAspects);
      setGroupAspects(editableGroupAspects);
      setIsEditingGroup(false);
    } catch (err) {
      console.error("Failed to save group aspects:", err);
    }
  };

  const handleSubmit = async () => {

    alert("Aspects submitted successfully!");
    // try {
    //   const aspectResponse = await postRequest(`q/submit_aspects/${id}/`);
      
    // } catch (error) {
    //   console.error("Error submitting data:", error);
    // }
  };

  const handledeleteoverall = (index) => {
    const updated = [...editableOverall];
    updated.splice(index, 1);
    setEditableOverall(updated);
  };

  const handledeletegroup = (category, index) => {
    const updated = { ...editableGroupAspects };
    updated[category].splice(index, 1);
    setEditableGroupAspects(updated);
  };

  // New functions for dropdown functionality
  const getAvailableParameters = (code) => {
    const existingParams = editableOverall
      .filter(item => item.c === code)
      .map(item => item.par);
    return allPara.filter(param => !existingParams.includes(param));
  };

  const getgroupParameters = (category) => {
      const existingParams = editableGroupAspects[category].map(item => item.par);
      return allPara.filter(param => !existingParams.includes(param));
  }

  const handleAddButtonClick = (code) => {
    setShowDropdown(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleParameterSelect = (code, parameter) => {
    setAddingParameter(prev => ({ ...prev, [code]: { par: parameter, p: 0, w: 0 } }));
    setShowDropdown(prev => ({ ...prev, [code]: false }));
  };

  const handleParameterInputChange = (code, field, value) => {
    setAddingParameter(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: value }
    }));
  };

  const confirmAddParameter = (code) => {
    const newParam = { ...addingParameter[code], c: code };
    setEditableOverall(prev => [...prev, newParam]);
    setAddingParameter(prev => ({ ...prev, [code]: null }));
  };

  const cancelAddParameter = (code) => {
    setAddingParameter(prev => ({ ...prev, [code]: null }));
  };


   // Function to handle group add button click
const handleGroupAddButtonClick = (category) => {
  setShowGroupDropdown(prev => ({ ...prev, [category]: !prev[category] }));
};

// Function to handle group parameter selection
const handleGroupParameterSelect = (category, parameter) => {
  setAddGroupParameter(prev => ({ 
    ...prev, 
    [category]: { par: parameter, w: 0 } 
  }));
  setShowGroupDropdown(prev => ({ ...prev, [category]: false }));
};

// Function to handle group parameter input change (fix the existing one)
const handleGroupInputChange = (category, field, value) => {
  setAddGroupParameter(prev => ({
    ...prev,
    [category]: { ...prev[category], [field]: value }
  }));
};

// Function to confirm adding group parameter (fix the existing one)
const confirmGroupParameter = (category) => {
  const newParam = { ...addGroupParameter[category] };
  setEditableGroupAspects(prev => ({
    ...prev,
    [category]: [...prev[category], newParam]
  }));
  setAddGroupParameter(prev => ({ ...prev, [category]: null }));
};

// Function to cancel adding group parameter
const cancelGroupParameter = (category) => {
  setAddGroupParameter(prev => ({ ...prev, [category]: null }));
};

  const NewPara = () => {
    const [Newapsect, setNewAspect] = useState({ parameter: '', evaluation_method: '' });

    const handlechange = (e) => {
      setNewAspect({ ...Newapsect, parameter: e.target.value });
    };

    const handlechange1 = (e) => {
      setNewAspect({ ...Newapsect, evaluation_method: e.target.value });
    };

    const handleAdd = async () => {
      try {
        const response = await postRequest(`a/add_new_parameter/${id}/`, Newapsect);
        setallPara(prev => [...prev, Newapsect.parameter]);
        setNewAspect({ parameter: '', evaluation_method: '' });
      } catch (err) {
        console.error("Failed to save new parameter:", err);
      }
    };

    return (
      <div className='aspects_new-parameter'>
        <div className="aspects_new_name">
          <h3>Parameter</h3>
          <input type="text" value={Newapsect.parameter} onChange={handlechange} />
        </div>
        <div className="aspects_new_evaluation">
          <h3>How to Evaluate It</h3>
          <input type="text" value={Newapsect.evaluation_method} onChange={handlechange1} />
        </div>
        <button className="aspects_new_add" onClick={handleAdd}>Add</button>
      </div>
    );
  };

if (loading) {
  return (
    <>
      <Navbar_Home />
      <div className="aspects_loading_container">
      <div className="aspects_loading_heading">
        Generating Aspects...
      </div>
      
      {/* Horizontal oscillating loader */}
      <div className="loading-spinner"></div>
      
      {/* Horizontal bouncing dots */}
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Horizontal progress bar */}
      <div className="loading-progress"></div>
      
      <p className="aspects_loading_side">This may take a while</p>
      <p className="aspects_loading_sub">till then you can navigate through website</p>
      </div>
    </>
  );
}

  return (
    <>
      <Navbar_Home />
      <div className='aspects_container'>
        <div className="aspects_Showbuttons">
          <div className='aspects_btn'><button onClick={() => handleAllDisplay({ category: 'parameters' })} className={showParameters ? "aspects_active" : "aspects_deactive"}>Parameters</button></div>
          <div className='aspects_btn'><button onClick={() => handleAllDisplay({ category: 'overall' })} className={showOverall ? "aspects_active" : "aspects_deactive"}>Overall Score</button></div>
          <div className='aspects_btn'><button onClick={() => handleAllDisplay({ category: 'group' })} className={showGroup ? "aspects_active" : "aspects_deactive"}>Group Aspects</button></div>
        </div>

        {/* PARAMETERS */}
        {showParameters && (
          <div>
            <div className='aspects_hcontainer'><h1 className='aspects_heading'>Parameters</h1></div>
            <div className="aspects_table_c">
              <table className="aspects_styled-table">
                <thead><tr><th>Parameter</th></tr></thead>
                <tbody>{allPara.map((para) => (<tr key={para}><td>{para}</td></tr>))}</tbody>
              </table>
            </div>
            {/* <button className="aspects_submit_btn" onClick={() => setShowNewPara(!showNewPara)}>Edit</button>
            {showNewPara && <NewPara />} */}
          </div>
        )}

        {/* OVERALL */}
        {showOverall && (
          <div className="aspects_overall-aspects">
            <div className='aspects_hcontainer'><h1 className='aspects_heading'>Overall Score</h1></div>
            {["n", "e", "d"].map(code => {
              const label = code === "n" ? "Non-negotiable" : code === "e" ? "Essential" : "Desirable";
              const filteredOverall = editableOverall.filter(ov => ov.c === code);
              const availableParams = getAvailableParameters(code);
              
              return (
                <div key={code} className='aspects_table_c'>
                  <table className="aspects_styled-table">
                    <thead>
                      <h2 className='aspects_table_heading'>{label} Parameters</h2>
                      <tr>
                        <th>Parameter</th>
                        <th>Penalty</th>
                        <th>Weightage</th>
                        {isEditingOverall && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOverall.map((ov, i) => {
                        const actualIndex = editableOverall.findIndex(item => item.par === ov.par && item.c === ov.c);
                        return (
                          <tr key={ov.par}>
                            <td>{ov.par}</td>
                            {isEditingOverall ? (
                              <>
                                <td>
                                  <input
                                    className='aspects_edit_input'
                                    type="number"
                                    value={editableOverall[actualIndex].p}
                                    onChange={(e) => {
                                      const updated = [...editableOverall];
                                      updated[actualIndex].p = e.target.value;
                                      setEditableOverall(updated);
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='aspects_edit_input'
                                    type="number"
                                    value={editableOverall[actualIndex].w}
                                    onChange={(e) => {
                                      const updated = [...editableOverall];
                                      updated[actualIndex].w = e.target.value;
                                      setEditableOverall(updated);
                                    }}
                                  />
                                </td>
                                {
                                  <td>
                                    <button className='aspects_edit_delete' onClick={() => handledeleteoverall(actualIndex)}>Delete</button>
                                  </td>
                                }
                              </>
                            ) : (
                              <>
                                <td>{ov.p}</td>
                                <td>{ov.w}</td>
                                {isEditingOverall && <td></td>}
                              </>
                            )}
                          </tr>
                        );
                      })}
                      
                      {/* Adding parameter row */}
                      {addingParameter[code] && (
                        <tr className="aspects_adding_row">
                          <td>{addingParameter[code].par}</td>
                          <td>
                            <input
                              className='aspects_add_input'
                              type="number"
                              placeholder="Penalty"
                              value={addingParameter[code].p}
                              onChange={(e) => handleParameterInputChange(code, 'p', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className='aspects_add_input'
                              type="number"
                              placeholder="Weightage"
                              value={addingParameter[code].w}
                              onChange={(e) => handleParameterInputChange(code, 'w', e.target.value)}
                            />
                          </td>
                          <td>
                            <div className="aspects_add_actions">
                              <button 
                                className="aspects_confirm_add"
                                onClick={() => confirmAddParameter(code)}
                              >
                                ✓
                              </button>
                              <button 
                                className="aspects_cancel_add"
                                onClick={() => cancelAddParameter(code)}
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Add button and dropdown */}
                  {isEditingOverall && !addingParameter[code] && availableParams.length > 0 && (
                    <div className="aspects_add_section">
                      <button 
                        className="aspects_add_parameters"
                        onClick={() => handleAddButtonClick(code)}
                      >
                        {showDropdown[code] ? 'Cancel' : 'Add New'}
                      </button>
                      
                      {showDropdown[code] && (
                        <div className="aspects_dropdown">
                          <div className="aspects_dropdown_header">Select Parameter:</div>
                          {availableParams.map(param => (
                            <div
                              key={param}
                              className="aspects_dropdown_item"
                              onClick={() => handleParameterSelect(code, param)}
                            >
                              {param}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {isEditingOverall && !addingParameter[code] && availableParams.length === 0 && (
                    <div className="aspects_no_params">All parameters already added</div>
                  )}
                </div>
              );
            })}
            <button className='aspects_submit_btn' onClick={() => {
              if (isEditingOverall) {
                saveEditedOverall();
              } else {
                setIsEditingOverall(true);
              }
            }}>
              {isEditingOverall ? "Save Overall Score" : "Edit Overall Score"}
            </button>
          </div>
        )}

        {/* GROUP ASPECTS */}
        {showGroup && (
  <div className="aspects_groupaspects">
    <h1 className='aspects_heading'>Group Aspects</h1>
    {Object.keys(editableGroupAspects).map(category => {
      const availableParams = getgroupParameters(category);
      
      return (
        <div key={category} className='aspects_table_c'>
          <table className="aspects_styled-table">
            <thead>
              <h2 className='aspects_table_heading'>{category}</h2>
              <tr>
                <th>Parameter</th>
                <th>Weightage</th>
                {isEditingGroup && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {editableGroupAspects[category].map((aspect, index) => (
                <tr key={aspect.par}>
                  <td>{aspect.par}</td>
                  {isEditingGroup ? (
                    <>
                      <td>
                        <input
                          type="number"
                          className='aspects_edit_input'
                          value={editableGroupAspects[category][index].w}
                          onChange={(e) => {
                            const updated = { ...editableGroupAspects };
                            updated[category][index].w = e.target.value;
                            setEditableGroupAspects(updated);
                          }}
                        />
                      </td>
                      <td>
                        <button className='aspects_edit_delete' onClick={() => handledeletegroup(category, index)}>Delete</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{aspect.w}</td>
                      {isEditingGroup && <td></td>}
                    </>
                  )}
                </tr>
              ))}

              {/* Adding parameter row */}
              {addGroupParameter[category] && (
                <tr className="aspects_adding_row">
                  <td>{addGroupParameter[category].par}</td>
                  <td>
                    <input
                      className='aspects_add_input'
                      type="number"
                      placeholder="Weightage"
                      value={addGroupParameter[category].w}
                      onChange={(e) => handleGroupInputChange(category, 'w', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="aspects_add_actions">
                      <button 
                        className="aspects_confirm_add"
                        onClick={() => confirmGroupParameter(category)}
                      >
                        ✓
                      </button>
                      <button 
                        className="aspects_cancel_add"
                        onClick={() => cancelGroupParameter(category)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Add button and dropdown */}
          {isEditingGroup && !addGroupParameter[category] && availableParams.length > 0 && (
            <div className="aspects_add_section">
              <button 
                className="aspects_add_parameters"
                onClick={() => handleGroupAddButtonClick(category)}
              >
                {showGroupDropdown[category] ? 'Cancel' : 'Add New'}
              </button>
              
              {showGroupDropdown[category] && (
                <div className="aspects_dropdown">
                  <div className="aspects_dropdown_header">Select Parameter:</div>
                  {availableParams.map(param => (
                    <div
                      key={param}
                      className="aspects_dropdown_item"
                      onClick={() => handleGroupParameterSelect(category, param)}
                    >
                      {param}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {isEditingGroup && !addGroupParameter[category] && availableParams.length === 0 && (
            <div className="aspects_no_params">All parameters already added</div>
          )}
        </div>
      );
    })}
    <button className='aspects_submit_btn' onClick={() => {
      if (isEditingGroup) {
        saveEditedGroupAspects();
      } else {
        setIsEditingGroup(true);
      }
    }}>
      {isEditingGroup ? "Save Group Aspects" : "Edit Group Aspects"}
    </button>
  </div>
)}

        <button onClick={handleSubmit} className='aspects_submit_btn'>Submit</button>
      </div>
    </>
  );
};

export default AspectsL;
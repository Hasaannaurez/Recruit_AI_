// JobCreationFlow.jsx (parent component)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Add_Job_2 from '../Singles/Add_Job_2';
import QuestionnarieSingle from '../Singles/QuestionnarieSingle';
import Aspects from '../Singles/Aspects';
import ApplicantPage from './ApplicantsPage';
import { getRequest } from '../../utils/apiclient';

const JobSpecific = () => {
  const { id } = useParams();
  const [pointer, setPointer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPointer = async () => {
      try {
        const response = await getRequest(`job/get_job_pointer/${id}`);
        setPointer(response.Pointer);
      } catch (error) {
        console.error("Error fetching pointer:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPointer();
  }, [id]);

  const updatePointer = async () => {
    try {
      const response = await getRequest(`job/get_job_pointer/${id}`);
      setPointer(response.Pointer);
    } catch (error) {
      console.error("Error updating pointer:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Render the appropriate component based on pointer
  switch (pointer) {
    case 0:
      return <Add_Job_2 id={id} onComplete={updatePointer} />;
    case 1:
      return <QuestionnarieSingle id={id} onComplete={updatePointer} />;
    case 2:
      return <Aspects id={id} onComplete={updatePointer} />;
    case 3:
      return <ApplicantPage id={id} />;
    default:
      return <div>Invalid step</div>;
  }
};

export default JobSpecific;
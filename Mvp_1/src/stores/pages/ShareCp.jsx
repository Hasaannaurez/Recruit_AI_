import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRequest, postRequest } from "../../utils/apiclient";
import SharedCp from '../Singles/SharedCp';


const ShareCp = () => {
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [searchParams] = useSearchParams();

  const candidate_id = searchParams.get("id");

  const handleGoogleSuccess = async (credentialResponse) => {
    setShowGoogleLogin(false);
    const token = credentialResponse.credential;
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('google_token', token);

      const response = await postRequest('/c/api/cp-google-access/', {
        token,
        candidate_id,
      });

      if (response?.data?.message === "True") {
        showPage(token);
      } else {
        showAccessDenied();
      }
    } catch (err) {
      console.error('Error decoding token or fetching access:', err);
      setShowGoogleLogin(true);
    }
  };

  const showPage = async (token) => {
    try {
      const data = await getRequest(`/c/get_shared_candidate_profile/${candidate_id}`);
      setCandidateData(data);
      console.log("Candidate data:", data);
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    }
  };

  const showAccessDenied = () => {
    console.log("Access denied. Not authorized to view this page.");
    setCandidateData({ denied: true });
  };

  useEffect(() => {
    const token = localStorage.getItem('google_token');
    if (!candidate_id) {
      console.log("❌ No candidate_id in URL.");
      setCandidateData({ denied: true });
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          postRequest('/c/api/cp-google-access/', {
            token,
            candidate_id,
          })
            .then((res) => {
              if (res?.data?.message === "True") {
                showPage(token);
              } else {
                showAccessDenied();
              }
            })
            .catch(() => showAccessDenied());
        } else {
          localStorage.removeItem('google_token');
          setShowGoogleLogin(true);
        }
      } catch (err) {
        localStorage.removeItem('google_token');
        setShowGoogleLogin(true);
      }
    } else {
      setShowGoogleLogin(true);
    }
  }, [candidate_id]);

  return (
    <div>
      {showGoogleLogin && (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Google login failed')}
        />
      )}

      {candidateData && !candidateData.denied && (
           <SharedCp candidatedata = {candidateData} id = {candidate_id} />
      )}

      {candidateData?.denied && (
        <div>
          <h3>Access Denied</h3>
          <p>You are not authorized to view this candidate profile.</p>
        </div>
      )}
    </div>
  );
};

export default ShareCp;
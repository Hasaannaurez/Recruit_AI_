import React from 'react'
import './App.css'
import LandingPage from './stores/pages/LandingPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './stores/pages/LoginPage.jsx'
import Home from './stores/pages/Home.jsx'
import JobOpenings from './stores/pages/JobOpenings'
import RegisterPage from './stores/pages/RegisterPage.jsx'
import Add_Job from './stores/pages/Add_Job.jsx'
import Candiate2 from './stores/Singles/Candiate2.jsx'
import GlobalPage from './stores/pages/GlobalPage.jsx'
import JobSpecific from './stores/pages/JobSpecific.jsx'
import ShareCp from './stores/pages/ShareCp.jsx'
import Tokyo from './stores/pages/tokyo.jsx'
import AspectsL from './stores/Singles/AspectsL.jsx'
import Candiate3 from './stores/Singles/Candidate3.jsx'
function App() {

  return(
    <BrowserRouter>
    <div className="Routers">
  <Routes>
  <Route path='/' element= {<LandingPage />} />
  <Route path='/SignIN' element= {<LoginPage/>} />
  <Route path='/Home' element = {<Home/>} />
  <Route path='/Home/profiles' element = {<GlobalPage />} />
  <Route path='/Home/:profiles_id/:id' element={<Candiate2 />} />
  <Route path='/Home/candidates/:id' element={<Candiate3 />} />
  <Route path='/Home/JobOpenings' element={<JobOpenings/>} />
  <Route path='/Register' element={<RegisterPage/>} />
  <Route path='/Home/newrole' element={<Add_Job/>} />
  <Route path='/Home/:id' element={<JobSpecific/>} />
  <Route path='/Home/cp' element={<ShareCp />} />
  <Route path='/Home/tokyo' element={<Tokyo />} />
  <Route path ='/Home/aspects/:id' element = {<AspectsL />} />
  </Routes>
  </div>
  </BrowserRouter>
  )
}

export default App
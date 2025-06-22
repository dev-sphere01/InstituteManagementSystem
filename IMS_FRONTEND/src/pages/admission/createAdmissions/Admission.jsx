import React from 'react'
import Stepper from './components/Stepper'
import BasicInfo from './components/BasicInfo'
import Contact from './components/Contact'
import Document from './components/Documents'
import Review from './components/Review'
import Education from './components/Education'

const Admission = () => {
  return (
    <>
    <div>Admission</div>
    <Stepper/>
    <BasicInfo/>
    <Contact/>
    <Document/>
    <Education/>
    <Review/>
    </>
  )
}

export default Admission
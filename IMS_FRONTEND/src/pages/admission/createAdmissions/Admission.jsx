import React from 'react'
import Stepper from './components/Stepper'
import BasicInfo from './components/BasicInfo'
import Contact from './components/Contact'
import Document from './components/Documents'
import Review from './components/Review'
import Educational from './components/Educational'

const Admission = () => {
  return (
    <>
    <div>Admission</div>
    <Stepper/>
    <BasicInfo/>
    <Contact/>
    <Document/>
    <Educational/>
    <Review/>
    </>
  )
}

export default Admission
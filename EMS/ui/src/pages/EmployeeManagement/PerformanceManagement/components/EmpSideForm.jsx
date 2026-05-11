import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, Save, FileText, Star, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import useEmpDataStore from '@/store/empDataStore'

const EmpSideForm = ({ selectedSessionId, reviewSessions, loadingSessions }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [formMode, setFormMode] = useState('online') // 'online' or 'upload'
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        currentEmployee,
        fetchEmployeeById,
        getEmployeeDisplayName,
        loading,
        error
    } = useEmpDataStore();

    // Self-Assessment Form Data
    const [selfAssessmentData, setSelfAssessmentData] = useState({
        achievements: '',
        goalsObjectives: '',
        technicalChallenges: '',
        newIdeas: '',
        teamContribution: '',
        feedback: '',
        skillsLearned: '',
        keyFeedback: '',
        personalGrowth: '',
        priorityManagement: '',
        engagement: '',
        workSatisfaction: '',
        companyObjectives: '',
        futureGrowth: '',
        supportNeeded: '',
        suggestions: ''
    })

    // Self-Rating Data
    const [selfRatingData, setSelfRatingData] = useState({
        technicalCompetence: { rating: 0, comments: '' },
        problemSolving: { rating: 0, comments: '' },
        communication: { rating: 0, comments: '' },
        teamCollaboration: { rating: 0, comments: '' },
        ownershipAccountability: { rating: 0, comments: '' },
        speedDelivery: { rating: 0, comments: '' },
        innovationCreativity: { rating: 0, comments: '' }
    })

    const ratingAreas = [
        {
            key: 'technicalCompetence',
            area: 'Technical Competence',
            description: 'Your ability to apply software engineering skills, tools, and frameworks effectively. Includes understanding of system architecture, code efficiency, and use of best practices.'
        },
        {
            key: 'problemSolving',
            area: 'Problem-Solving',
            description: 'How effectively you identify, analyze, and solve technical and product-related problems. Includes debugging, root cause analysis, and ability to find creative solutions.'
        },
        {
            key: 'communication',
            area: 'Communication',
            description: 'Clarity and effectiveness in sharing information with team members, product owners, and other stakeholders. Includes both written (e.g., documentation, tickets) and verbal communication.'
        },
        {
            key: 'teamCollaboration',
            area: 'Team Collaboration',
            description: 'Your ability to work constructively with others—participating in stand-ups, code reviews, knowledge sharing, and cross-functional projects.'
        },
        {
            key: 'ownershipAccountability',
            area: 'Ownership & Accountability',
            description: 'Taking initiative and responsibility for your work. Includes following through on tasks, meeting deadlines, and owning the outcome (both successes and failures).'
        },
        {
            key: 'speedDelivery',
            area: 'Speed & Delivery',
            description: 'Your pace of execution without compromising on quality. Includes consistently delivering code/features as per sprint timelines or project goals.'
        },
        {
            key: 'innovationCreativity',
            area: 'Innovation/Creativity',
            description: 'Willingness to try new approaches, tools, or ideas to improve product functionality or internal processes. Includes automation, process optimizations, or UX enhancements.'
        }
    ]

    const selfAssessmentQuestions = [
        {
            id: 1,
            field: 'achievements',
            question: 'List your top 3–5 achievements this period.',
            placeholder: 'Describe your key achievements...'
        },
        {
            id: 2,
            field: 'goalsObjectives',
            question: 'What goals / objectives were achieved or missed? Include reasons.',
            placeholder: 'Detail your goals and objectives...'
        },
        {
            id: 3,
            field: 'technicalChallenges',
            question: 'Describe any technical challenges and how you addressed them.',
            placeholder: 'Explain technical challenges faced...'
        },
        {
            id: 4,
            field: 'newIdeas',
            question: 'Did you propose or implement any new ideas, tools, or processes?',
            placeholder: 'Describe new ideas or innovations...'
        },
        {
            id: 5,
            field: 'teamContribution',
            question: 'How did you contribute to your team success?',
            placeholder: 'Explain your team contributions...'
        },
        {
            id: 6,
            field: 'feedback',
            question: 'Any feedback from users, clients, or internal stakeholders?',
            placeholder: 'Share feedback received...'
        },
        {
            id: 7,
            field: 'skillsLearned',
            question: 'What new skills, tools, or tech have you learned or improved?',
            placeholder: 'List skills and technologies learned...'
        },
        {
            id: 8,
            field: 'keyFeedback',
            question: 'Mention any key feedback received and how you acted on it.',
            placeholder: 'Describe key feedback and actions taken...'
        },
        {
            id: 9,
            field: 'personalGrowth',
            question: 'Where have you seen personal/professional growth?',
            placeholder: 'Reflect on your growth areas...'
        },
        {
            id: 10,
            field: 'priorityManagement',
            question: 'How did you manage priorities and workload?',
            placeholder: 'Describe your approach to managing priorities...'
        },
        {
            id: 11,
            field: 'engagement',
            question: 'How engaged/motivated have you felt, and why?',
            placeholder: 'Share your engagement and motivation levels...'
        },
        {
            id: 12,
            field: 'workSatisfaction',
            question: 'How satisfied are you with the work you have delivered and your job profile?',
            placeholder: 'Reflect on your work satisfaction...'
        },
        {
            id: 13,
            field: 'companyObjectives',
            question: 'How did you demonstrate company objectives in your work?',
            placeholder: 'Explain how you aligned with company objectives...'
        },
        {
            id: 14,
            field: 'futureGrowth',
            question: 'Where do you see yourself growing in the next 6–12 months?',
            placeholder: 'Describe your future growth plans...'
        },
        {
            id: 15,
            field: 'supportNeeded',
            question: 'What support/resources would help you perform better?',
            placeholder: 'List support or resources needed...'
        },
        {
            id: 16,
            field: 'suggestions',
            question: 'Any suggestions for leadership, process, or team improvements?',
            placeholder: 'Share your suggestions for improvements...'
        }
    ]

    // Load data from session storage on component mount
    useEffect(() => {
        const savedSelfAssessment = sessionStorage.getItem('appraisal_self_assessment')
        const savedSelfRating = sessionStorage.getItem('appraisal_self_rating')
        const savedStep = sessionStorage.getItem('appraisal_current_step')

        if (savedSelfAssessment) {
            setSelfAssessmentData(JSON.parse(savedSelfAssessment))
        }
        if (savedSelfRating) {
            setSelfRatingData(JSON.parse(savedSelfRating))
        }
        if (savedStep) {
            setCurrentStep(parseInt(savedStep))
        }
    }, [])

    const handleSelfAssessmentChange = (field, value) => {
        const updatedData = {
            ...selfAssessmentData,
            [field]: value
        }
        setSelfAssessmentData(updatedData)
        // Save to session storage
        sessionStorage.setItem('appraisal_self_assessment', JSON.stringify(updatedData))
    }

    const handleRatingChange = (area, field, value) => {
        const updatedData = {
            ...selfRatingData,
            [area]: {
                ...selfRatingData[area],
                [field]: value
            }
        }
        setSelfRatingData(updatedData)
        // Save to session storage
        sessionStorage.setItem('appraisal_self_rating', JSON.stringify(updatedData))
    }

    const handleDownloadForm = () => {
        const templatePath = '/templates/Appraisal_Template_EMP.xlsx'
        const fileName = `Appraisal_Template_EMP_${new Date().toISOString().split('T')[0]}.xlsx`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', templatePath)
        linkElement.setAttribute('download', fileName)
        linkElement.click()
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            // For now, we'll just show a message that the file was received
            // In a real implementation, you would parse the Excel file using a library like xlsx
            alert(`Excel file "${file.name}" received. Please implement Excel parsing functionality to extract the form data.`)

            // TODO: Implement Excel file parsing using libraries like:
            // - xlsx (SheetJS)
            // - exceljs
            // - react-excel-renderer

            // Example implementation would be:
            // import * as XLSX from 'xlsx'
            // const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
            // const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            // const data = XLSX.utils.sheet_to_json(worksheet)
            // Parse and map the data to selfAssessmentData and selfRatingData
        }
    }

    const handleStep1Submit = () => {
        setIsSubmitting(true)

        // Save step 1 data to session storage
        sessionStorage.setItem('appraisal_self_assessment', JSON.stringify(selfAssessmentData))
        sessionStorage.setItem('appraisal_current_step', '2')

        setTimeout(() => {
            setIsSubmitting(false)
            setCurrentStep(2)
            // alert('Self-Assessment saved successfully! Please proceed to Self-Rating.')
        }, 1000)
    }

    const handleFinalSubmit = () => {
        setIsSubmitting(true)

        const finalPayload = {
            EmpID: currentEmployee.EmpID, // TODO: Replace with actual employee ID
            Achievements: selfAssessmentData.achievements,
            GoalsObjectives: selfAssessmentData.goalsObjectives,
            TechnicalChallenges: selfAssessmentData.technicalChallenges,
            NewIdeas: selfAssessmentData.newIdeas,
            TeamContribution: selfAssessmentData.teamContribution,
            Feedback: selfAssessmentData.feedback,
            SkillsLearned: selfAssessmentData.skillsLearned,
            KeyFeedback: selfAssessmentData.keyFeedback,
            PersonalGrowth: selfAssessmentData.personalGrowth,
            PriorityManagement: selfAssessmentData.priorityManagement,
            Engagement: selfAssessmentData.engagement,
            WorkSatisfaction: selfAssessmentData.workSatisfaction,
            CompanyObjectives: selfAssessmentData.companyObjectives,
            FutureGrowth: selfAssessmentData.futureGrowth,
            SupportNeeded: selfAssessmentData.supportNeeded,
            Suggestions: selfAssessmentData.suggestions,
            TechnicalCompetenceRating: selfRatingData.technicalCompetence.rating,
            TechnicalCompetenceComments: selfRatingData.technicalCompetence.comments,
            ProblemSolvingRating: selfRatingData.problemSolving.rating,
            ProblemSolvingComments: selfRatingData.problemSolving.comments,
            CommunicationRating: selfRatingData.communication.rating,
            CommunicationComments: selfRatingData.communication.comments,
            TeamCollaborationRating: selfRatingData.teamCollaboration.rating,
            TeamCollaborationComments: selfRatingData.teamCollaboration.comments,
            OwnershipAccountabilityRating: selfRatingData.ownershipAccountability.rating,
            OwnershipAccountabilityComments: selfRatingData.ownershipAccountability.comments,
            SpeedDeliveryRating: selfRatingData.speedDelivery.rating,
            SpeedDeliveryComments: selfRatingData.speedDelivery.comments,
            InnovationCreativityRating: selfRatingData.innovationCreativity.rating,
            InnovationCreativityComments: selfRatingData.innovationCreativity.comments,
            SubmittedAt: new Date().toISOString()
        }

        // Console log the payload
        console.log('Final Appraisal Payload:', finalPayload)

        setTimeout(() => {
            setIsSubmitting(false)
            // Clear session storage after successful submission
            sessionStorage.removeItem('appraisal_self_assessment')
            sessionStorage.removeItem('appraisal_self_rating')
            sessionStorage.removeItem('appraisal_current_step')

            alert('Appraisal form submitted successfully!')

            // Reset form
            setCurrentStep(1)
            setSelfAssessmentData({
                achievements: '',
                goalsObjectives: '',
                technicalChallenges: '',
                newIdeas: '',
                teamContribution: '',
                feedback: '',
                skillsLearned: '',
                keyFeedback: '',
                personalGrowth: '',
                priorityManagement: '',
                engagement: '',
                workSatisfaction: '',
                companyObjectives: '',
                futureGrowth: '',
                supportNeeded: '',
                suggestions: ''
            })
            setSelfRatingData({
                technicalCompetence: { rating: 0, comments: '' },
                problemSolving: { rating: 0, comments: '' },
                communication: { rating: 0, comments: '' },
                teamCollaboration: { rating: 0, comments: '' },
                ownershipAccountability: { rating: 0, comments: '' },
                speedDelivery: { rating: 0, comments: '' },
                innovationCreativity: { rating: 0, comments: '' }
            })
        }, 2000)
    }

    const goBackToStep1 = () => {
        setCurrentStep(1)
        sessionStorage.setItem('appraisal_current_step', '1')
    }

    const renderStarRating = (rating, onChange) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`p-1 rounded transition-colors ${star <= rating
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-gray-400'
                            }`}
                    >
                        <Star className="h-5 w-5 fill-current" />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
            </div>
        )
    }

    const isStep1Complete = () => {
        return Object.values(selfAssessmentData).some(value => value.trim() !== '')
    }

    const isStep2Complete = () => {
        return Object.values(selfRatingData).some(item => item.rating > 0)
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6"
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Performance Appraisal</h1>
                <p className="text-gray-600">Complete your self-assessment and rating for the current review period.</p>



                {/* Form Mode Selection */}
                <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="online"
                            name="formMode"
                            value="online"
                            checked={formMode === 'online'}
                            onChange={(e) => setFormMode(e.target.value)}
                            className="text-blue-600"
                        />
                        <label htmlFor="online" className="text-sm font-medium text-gray-700">
                            Fill Online
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="upload"
                            name="formMode"
                            value="upload"
                            checked={formMode === 'upload'}
                            onChange={(e) => setFormMode(e.target.value)}
                            className="text-blue-600"
                        />
                        <label htmlFor="upload" className="text-sm font-medium text-gray-700">
                            Download & Upload Excel
                        </label>
                    </div>

                    {formMode === 'upload' && (
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={handleDownloadForm}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Download Excel Template
                            </button>

                            <label className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm cursor-pointer">
                                <Upload className="h-4 w-4" />
                                Upload Excel File
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Progress Indicator - Only show when Fill Online is selected */}
                {formMode === 'online' && (
                    <div className="flex items-center mt-6">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-300'
                                }`}>
                                {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                Self-Assessment
                            </span>
                        </div>

                        <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>

                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= 2 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-300'
                                }`}>
                                2
                            </div>
                            <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                Self-Rating
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>

            {formMode === 'online' && (
                <>
                    {/* Step 1: Self-Assessment */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Step 1: Self-Assessment</h2>

                            <div className="space-y-4">
                                {selfAssessmentQuestions.map((question, index) => (
                                    <div
                                        key={question.field}
                                        className={`grid grid-cols-2 gap-6 items-start ${index < selfAssessmentQuestions.length - 1 ? 'border-b border-gray-200 pb-4' : ''
                                            }`}
                                    >
                                        <div className="text-sm font-medium text-gray-700">
                                            {question.id}. {question.question}
                                        </div>
                                        <textarea
                                            value={selfAssessmentData[question.field]}
                                            onChange={(e) => handleSelfAssessmentChange(question.field, e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none"
                                            placeholder={question.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Step 1 Submit Button */}
                            <div className="flex justify-end mt-8">
                                <motion.button
                                    onClick={handleStep1Submit}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting || !isStep1Complete()}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save & Continue to Step 2
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Self-Rating */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Step 2: Self-Rating (1-5 Scale)</h2>
                            <p className="text-sm text-gray-600 mb-6">Rate yourself on each area where 1 is the lowest and 5 is the highest.</p>

                            <div className="space-y-8">
                                {ratingAreas.map((area) => (
                                    <div key={area.key} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            {/* Area Name */}
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">{area.area}</h3>
                                                <p className="text-xs text-gray-600">{area.description}</p>
                                            </div>

                                            {/* Rating */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Self Rating (1–5)
                                                </label>
                                                {renderStarRating(
                                                    selfRatingData[area.key].rating,
                                                    (rating) => handleRatingChange(area.key, 'rating', rating)
                                                )}
                                            </div>

                                            {/* Comments */}
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Comments
                                                </label>
                                                <textarea
                                                    value={selfRatingData[area.key].comments}
                                                    onChange={(e) => handleRatingChange(area.key, 'comments', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none"
                                                    placeholder="Add your comments..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Step 2 Navigation */}
                            <div className="flex justify-between mt-8">
                                <motion.button
                                    onClick={goBackToStep1}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Step 1
                                </motion.button>

                                <motion.button
                                    onClick={handleFinalSubmit}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting || !isStep2Complete()}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Submit Final Appraisal
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {formMode === 'upload' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center"
                >
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Download & Upload Excel Mode</h2>
                    <p className="text-gray-600 mb-6">
                        Download the Excel template, fill it offline, and upload the completed Excel file.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleDownloadForm}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download Excel Template
                        </button>

                        <label className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer">
                            <Upload className="h-4 w-4" />
                            Upload Completed Excel
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default EmpSideForm
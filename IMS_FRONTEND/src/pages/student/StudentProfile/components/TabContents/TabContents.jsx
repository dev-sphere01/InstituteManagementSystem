import Documents from './tabs/Documents'
import Fee from './tabs/Fee'
import Course from './tabs/Course'
import Academic from './tabs/Academic'
import PersonalInfo from './tabs/PersonalInfo'
import ExamDetails from './tabs/ExamDetails'


const TabContents = ({ student, InfoCard, InfoRow, activeTab,API,isDarkMode,id }) => {
    return (
        <div className="space-y-4">
            {activeTab === "personal" && (
                <PersonalInfo student={student} InfoCard={InfoCard} InfoRow={InfoRow} />
            )}

            {activeTab === "academic" && (
                <Academic student={student} InfoCard={InfoCard} InfoRow={InfoRow} />
            )}

            {activeTab === "documents" && (
                <Documents student={student} InfoCard={InfoCard} InfoRow={InfoRow} />
            )}
            {activeTab === "course" && (
                <Course student={student} InfoCard={InfoCard} InfoRow={InfoRow} />
            )}

            {activeTab === "fee" && (
                <Fee student={student} InfoCard={InfoCard} InfoRow={InfoRow} />
            )}
            {activeTab === "exam" && (
                <ExamDetails student={student} InfoCard={InfoCard} InfoRow={InfoRow} API={API} isDarkMode={isDarkMode} id={id}  />
            )}

        </div>
    )
}

export default TabContents
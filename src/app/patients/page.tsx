
import AppLayout from '../AppLayout'
import PatientList from '@/components/PatientList'
import { CalendarProvider } from '@/components/calendar/calendar-context'
import FloatingActionButton from '@/components/FloatingActionButton'
import InternalPasswordCheck from '@/components/InternalPasswordCheck'


export default function Home() {
  return (
    <AppLayout>
        <PatientList/>
        <FloatingActionButton/>
        <InternalPasswordCheck />
    </AppLayout>
  )
}


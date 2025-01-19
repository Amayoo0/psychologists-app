
import AppLayout from '../AppLayout'
import PatientList from '@/components/PatientList'
import { CalendarProvider } from '@/components/calendar/calendar-context'
import FloatingActionButton from '@/components/FloatingActionButton'


export default function Home() {
  return (
    <AppLayout>
      <CalendarProvider>
        <PatientList/>
        <FloatingActionButton/>
      </CalendarProvider>
    </AppLayout>
  )
}


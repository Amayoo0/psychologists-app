'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NewPatientDialog from './NewPatientDialog'
import { EventDialog } from './EventDialog'

export default function FloatingActionButton() {
    const [showEventDialog, setShowEventDialog] = useState(false)
  
  const [newPatientDialogOpen, setNewPatientDialogOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => setShowEventDialog(true)}>
            Agendar Cita
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNewPatientDialogOpen(true)}>
            Nuevo Paciente
          </DropdownMenuItem>
          <DropdownMenuItem>Otros</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
      />
      <NewPatientDialog
        open={newPatientDialogOpen}
        onOpenChange={setNewPatientDialogOpen}
      />
    </div>
  )
}


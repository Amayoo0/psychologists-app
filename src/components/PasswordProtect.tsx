'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePatientContext } from './patient/patient-context'
import NewPatientDialog from './NewPatientDialog'

export function PasswordProtect() {
  const { isOpen, selectedPatient, closeDialog } = usePatientContext()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuthenticate = () => {
    if (password === 'password123') {
      setIsAuthenticated(true)
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const handleClose = () => {
    closeDialog()
    setPassword('')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    closeDialog()
    setPassword('')

  
  }, [isAuthenticated])

  return (
    <NewPatientDialog 
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedPatient?.name}</DialogTitle>
          <DialogDescription>
            {isAuthenticated ? (
              <div>
                <p>ID: {selectedPatient?.id}</p>
                <p>Nombre: {selectedPatient?.name}</p>
                {/* Aquí puedes agregar más información del paciente */}
              </div>
            ) : (
              <div className="space-y-4">
                <p>Ingrese la contraseña para ver los detalles del paciente</p>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                />
                <Button onClick={handleAuthenticate}>Verificar</Button>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


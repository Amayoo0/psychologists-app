'use client'

import { use, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCalendar } from '@/components/calendar/calendar-context'
import { createHash } from 'crypto'

interface PasswordProtectProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthenticated?: () => void
  title?: string
  description?: string
  children: React.ReactNode
}

export function PasswordProtect({
	open,
	onOpenChange,
	onAuthenticated,
	title,
	description,
	children,
}: PasswordProtectProps) {
  const { isAuthenticated, setIsAuthenticated, internalPassword, salt } = useCalendar()
  const [password, setPassword] = useState('')

  const handleAuthenticate = () => {
	const hash = createHash('sha256');
	hash.update(password + salt);
	const hashedPassword = hash.digest('hex');
	console.log(hashedPassword)
    if (hashedPassword === internalPassword) {
      onAuthenticated?.();
      setIsAuthenticated(true)
    } else {
      alert('Contraseña incorrecta')
    }
  }

  useEffect(() => {
	if (isAuthenticated){
		onAuthenticated?.();
	}
  }, [])


  return (
    <>
		{isAuthenticated ? children : (
			<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title ?? "Contraseña requerida"}</DialogTitle>
					<DialogDescription>
						{description ?? "Por favor, ingresa la contraseña para continuar"}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-row items-center space-x-2" />
				<Input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Contraseña"
				/>
				<Button onClick={handleAuthenticate}>Verificar</Button>
			</DialogContent>
			</Dialog>
		)}
		</>
	)
}
    


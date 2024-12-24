'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from '@/lib/prisma'

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isLogin }),
      })
      const data = await response.json()
      if (response.ok) {
        router.push('/dashboard')
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      // TODO: Mostrar un estado de error y mostrarlo al usuario
      setError('Se produjo un error enviando los datos. Por favor, inténtelo más tarde.')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div id="error" className='text-red-600'>
          <p>{error}</p>
        </div>
        <Button type="submit" className="w-full">
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="text-center">
        {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="ml-1"
        >
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </Button>
      </p>
    </div>
  )
}


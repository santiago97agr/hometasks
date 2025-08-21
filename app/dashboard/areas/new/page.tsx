'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewAreaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#6B7280', '#F97316', '#8B5A2B', '#059669'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/areas')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear el área')
      }
    } catch (error) {
      setError('Error al crear el área')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard/areas" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a áreas
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Área</CardTitle>
            <CardDescription>
              Crea una nueva área para organizar tus tareas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del área *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Cocina, Baño, Sala..."
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <div className="space-y-4">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    required
                    className="w-20 h-10"
                  />
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">O selecciona un color predefinido:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-10 h-10 rounded-md border-2 ${
                            formData.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-lg font-medium">
                    {formData.name || 'Nombre del área'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard/areas">
                  <Button type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creando...' : 'Crear Área'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

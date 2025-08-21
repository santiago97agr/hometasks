'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Palette } from 'lucide-react'
import Link from 'next/link'

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export default function EditAreaPage() {
  const router = useRouter()
  const params = useParams()
  const areaId = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos del área
  const { data: area, isLoading: areaLoading } = useQuery({
    queryKey: ['area', areaId],
    queryFn: async () => {
      const response = await fetch(`/api/areas/${areaId}`)
      if (!response.ok) throw new Error('Error al cargar área')
      return response.json()
    }
  })

  // Llenar el formulario cuando se carga el área
  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || '',
        color: area.color || '#3B82F6',
      })
    }
  }, [area])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/areas/${areaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/areas')
      } else {
        const data = await response.json()
        console.log('Error data:', data)
        if (data.details && data.details.length > 0) {
          setError(`Errores de validación: ${data.details.map((d: any) => d.message).join(', ')}`)
        } else {
          setError(data.error || 'Error al actualizar el área')
        }
      }
    } catch (error) {
      setError('Error al actualizar el área')
    } finally {
      setLoading(false)
    }
  }

  if (areaLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando área...</p>
        </div>
      </div>
    )
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Área no encontrada</h2>
          <Link href="/dashboard/areas">
            <Button>Volver a áreas</Button>
          </Link>
        </div>
      </div>
    )
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
            <CardTitle>Editar Área</CardTitle>
            <CardDescription>
              Actualiza los datos de tu área
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
                  placeholder="Ej: Cocina, Baño, Sala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                
                {/* Vista previa del color */}
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm text-gray-600">Color seleccionado: {formData.color}</span>
                </div>

                {/* Colores predefinidos */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                        formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Input de color personalizado */}
                <div className="flex items-center space-x-3">
                  <Palette className="h-4 w-4 text-gray-400" />
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-20 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Color personalizado</span>
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
                  {loading ? 'Actualizando...' : 'Actualizar Área'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

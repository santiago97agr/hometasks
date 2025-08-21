'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'WEEKLY',
    areaId: '',
    startDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos de la tarea
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) throw new Error('Error al cargar tarea')
      return response.json()
    }
  })

  // Cargar áreas
  const { data: areas } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas')
      if (!response.ok) throw new Error('Error al cargar áreas')
      return response.json()
    }
  })

  // Llenar el formulario cuando se carga la tarea
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        frequency: task.frequency || 'WEEKLY',
        areaId: task.areaId || '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          areaId: formData.areaId || undefined,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/tasks')
      } else {
        const data = await response.json()
        console.log('Error data:', data)
        if (data.details && data.details.length > 0) {
          setError(`Errores de validación: ${data.details.map((d: any) => d.message).join(', ')}`)
        } else {
          setError(data.error || 'Error al actualizar la tarea')
        }
      }
    } catch (error) {
      setError('Error al actualizar la tarea')
    } finally {
      setLoading(false)
    }
  }

  const getFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY':
        return 'Se realiza una vez por semana (se resetea cada lunes)'
      case 'MONTHLY':
        return 'Se realiza una vez por mes (se resetea el 1° de cada mes)'
      case 'QUARTERLY':
        return 'Se realiza una vez por trimestre (se resetea en enero, abril, julio, octubre)'
      case 'BIANNUAL':
        return 'Se realiza una vez por semestre (se resetea en enero y julio)'
      case 'ANNUAL':
        return 'Se realiza una vez por año (se resetea cada enero)'
      default:
        return ''
    }
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando tarea...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard/tasks" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a tareas
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Tarea</CardTitle>
            <CardDescription>
              Modifica los detalles de la tarea doméstica
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
                  Nombre de la tarea *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Limpiar cocina"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada de la tarea..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia *
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="BIANNUAL">Semestral</option>
                  <option value="ANNUAL">Anual</option>
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  {getFrequencyDescription(formData.frequency)}
                </p>
              </div>

              {areas && areas.length > 0 && (
                <div>
                  <label htmlFor="areaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Área
                  </label>
                  <select
                    id="areaId"
                    value={formData.areaId}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin área específica</option>
                    {areas.map((area: any) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio *
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  La tarea estará disponible a partir de esta fecha
                </p>
              </div>

              {/* Info box explicativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      ¿Cómo funcionan las periodicidades?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Semanal:</strong> Una vez por semana, se resetea cada lunes</li>
                        <li><strong>Mensual:</strong> Una vez por mes, se resetea el 1° de cada mes</li>
                        <li><strong>Trimestral:</strong> Una vez por trimestre, se resetea cada 3 meses</li>
                        <li><strong>Semestral:</strong> Una vez por semestre, se resetea cada 6 meses</li>
                        <li><strong>Anual:</strong> Una vez por año, se resetea cada enero</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard/tasks">
                  <Button variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Actualizando...' : 'Actualizar Tarea'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Home } from 'lucide-react'
import Link from 'next/link'

export default function AreasPage() {
  const [deletingArea, setDeletingArea] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas')
      if (!response.ok) throw new Error('Error al cargar áreas')
      return response.json()
    }
  })

  const deleteArea = async (areaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta área? Las tareas asociadas quedarán sin área asignada.')) {
      return
    }

    setDeletingArea(areaId)
    try {
      const response = await fetch(`/api/areas/${areaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Actualizar la lista de áreas
        queryClient.invalidateQueries({ queryKey: ['areas'] })
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar el área')
      }
    } catch (error) {
      alert('Error al eliminar el área')
    } finally {
      setDeletingArea(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">HomeTasks</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Dashboard
            </Link>
            <Link href="/dashboard/tasks" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Tareas
            </Link>
            <Link href="/dashboard/areas" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              Áreas
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Áreas</h2>
            <p className="text-gray-600">Organiza tus tareas por áreas de la casa</p>
          </div>
          <Link href="/dashboard/areas/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </Link>
        </div>

        {/* Areas grid */}
        {areas && areas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((area: any) => (
              <Card key={area.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-mono text-sm">{area.color}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Creada:</span>
                      <span className="text-sm">
                        {new Date(area.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Link href={`/dashboard/areas/${area.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteArea(area.id)}
                      disabled={deletingArea === area.id}
                    >
                      {deletingArea === area.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes áreas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Crea áreas para organizar mejor tus tareas
              </p>
              <Link href="/dashboard/areas/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera área
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

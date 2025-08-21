'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Home } from 'lucide-react'
import Link from 'next/link'

export default function TasksPage() {
  const [deletingTask, setDeletingTask] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Error al cargar tareas')
      return response.json()
    }
  })

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return
    }

    setDeletingTask(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Actualizar la lista de tareas
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar la tarea')
      }
    } catch (error) {
      alert('Error al eliminar la tarea')
    } finally {
      setDeletingTask(null)
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
            <Link href="/dashboard/tasks" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              Tareas
            </Link>
            <Link href="/dashboard/areas" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Áreas
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
            <p className="text-gray-600">Administra todas tus tareas domésticas</p>
          </div>
          <Link href="/dashboard/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </Link>
        </div>

        {/* Tasks grid */}
        {tasks && tasks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task: any) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{task.name}</CardTitle>
                  <CardDescription>
                    {task.description || 'Sin descripción'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frecuencia:</span>
                      <span className="font-medium">
                        {task.frequency === 'WEEKLY' ? 'Semanal' :
                         task.frequency === 'MONTHLY' ? 'Mensual' :
                         task.frequency === 'QUARTERLY' ? 'Trimestral' :
                         task.frequency === 'BIANNUAL' ? 'Semestral' : 'Anual'}
                      </span>
                    </div>
                    {task.area && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Área:</span>
                        <span 
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ backgroundColor: task.area.color }}
                        >
                          {task.area.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Link href={`/dashboard/tasks/${task.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      disabled={deletingTask === task.id}
                    >
                      {deletingTask === task.id ? (
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
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes tareas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primera tarea doméstica
              </p>
              <Link href="/dashboard/tasks/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera tarea
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

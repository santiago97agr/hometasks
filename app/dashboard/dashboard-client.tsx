'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Home, CalendarDays, LogOut, Check, X, Calendar, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface TaskData {
  id: string
  name: string
  description: string
  isCompleted: boolean
  area?: {
    name: string
    color: string | null
  }
}

interface PeriodData {
  total: number
  completed: number
  pending: number
}

export default function DashboardClient() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [completingTask, setCompletingTask] = useState<string | null>(null)

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Error al cargar datos')
      return response.json()
    }
  })

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    setCompletingTask(taskId)
    try {
      const method = isCompleted ? 'DELETE' : 'POST'
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method,
      })

      if (response.ok) {
        // Refrescar datos del dashboard
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      } else {
        const data = await response.json()
        alert(data.error || 'Error al actualizar tarea')
      }
    } catch (error) {
      alert('Error al actualizar tarea')
    } finally {
      setCompletingTask(null)
    }
  }

  const renderTaskCard = (task: TaskData) => (
    <div 
      key={task.id} 
      className={`p-4 border rounded-lg transition-colors ${
        task.isCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {task.area && task.area.color && (
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: task.area.color }}
              />
            )}
            <div>
              <h4 className={`font-medium ${
                task.isCompleted ? 'text-green-800' : 'text-gray-900'
              }`}>
                {task.name}
              </h4>
              {task.description && (
                <p className={`text-sm ${
                  task.isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
              {task.area && (
                <span className="text-xs text-gray-500">
                  {task.area.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {task.isCompleted && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              ✓ Completada
            </span>
          )}
          
          <Button
            size="sm"
            variant={task.isCompleted ? "outline" : "default"}
            onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
            disabled={completingTask === task.id}
            className={task.isCompleted ? "text-red-600 hover:text-red-700" : ""}
          >
            {completingTask === task.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : task.isCompleted ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Desmarcar
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Completar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderPeriodSection = (
    title: string, 
    icon: React.ReactNode, 
    periodInfo: any, 
    tasks: TaskData[], 
    summary: PeriodData,
    emptyMessage: string
  ) => (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              {icon}
              {title}
            </CardTitle>
            <CardDescription>
              {periodInfo?.formatted}
            </CardDescription>
          </div>
          
          {/* Summary */}
          <div className="text-right">
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Progreso</div>
              <div className="text-xl font-bold text-gray-900">
                {summary.completed}/{summary.total}
              </div>
              <div className="text-sm text-gray-500">
                {summary.total > 0 
                  ? Math.round((summary.completed / summary.total) * 100)
                  : 0}% completado
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map(renderTaskCard)}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyMessage}
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tareas para empezar a organizar este período
            </p>
            <Link href="/dashboard/tasks/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear tarea
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ¡Hola, {session?.user?.name || session?.user?.email}!
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              Dashboard
            </Link>
            <Link href="/dashboard/tasks" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Tareas Periódicas
          </h2>
          <p className="text-gray-600">
            Gestiona tus tareas domésticas por períodos actuales
          </p>
        </div>

        {/* Quick actions */}
        <div className="mb-8 flex space-x-4">
          <Link href="/dashboard/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </Link>
          <Link href="/dashboard/areas/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </Link>
        </div>

        {/* Period Sections */}
        {dashboardData && (
          <div className="space-y-0">
            {/* Tareas Semanales */}
            {renderPeriodSection(
              "Tareas de Esta Semana",
              <CalendarDays className="h-5 w-5 mr-2" />,
              dashboardData.periods?.week,
              dashboardData.tasks?.weekly || [],
              dashboardData.summary?.weekly || { total: 0, completed: 0, pending: 0 },
              "No hay tareas semanales"
            )}

            {/* Tareas Mensuales */}
            {renderPeriodSection(
              "Tareas de Este Mes",
              <Calendar className="h-5 w-5 mr-2" />,
              dashboardData.periods?.month,
              dashboardData.tasks?.monthly || [],
              dashboardData.summary?.monthly || { total: 0, completed: 0, pending: 0 },
              "No hay tareas mensuales"
            )}

            {/* Tareas Trimestrales */}
            {renderPeriodSection(
              "Tareas de Este Trimestre",
              <Clock className="h-5 w-5 mr-2" />,
              dashboardData.periods?.quarter,
              dashboardData.tasks?.quarterly || [],
              dashboardData.summary?.quarterly || { total: 0, completed: 0, pending: 0 },
              "No hay tareas trimestrales"
            )}

            {/* Tareas Semestrales */}
            {renderPeriodSection(
              "Tareas de Este Semestre",
              <Users className="h-5 w-5 mr-2" />,
              dashboardData.periods?.biannual,
              dashboardData.tasks?.biannual || [],
              dashboardData.summary?.biannual || { total: 0, completed: 0, pending: 0 },
              "No hay tareas semestrales"
            )}

            {/* Tareas Anuales */}
            {renderPeriodSection(
              "Tareas de Este Año",
              <CalendarDays className="h-5 w-5 mr-2" />,
              dashboardData.periods?.year,
              dashboardData.tasks?.annual || [],
              dashboardData.summary?.annual || { total: 0, completed: 0, pending: 0 },
              "No hay tareas anuales"
            )}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CalendarDays className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¿Cómo funciona el sistema de períodos?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Semanal:</strong> Se resetea cada lunes</li>
                  <li><strong>Mensual:</strong> Se resetea el primer día de cada mes</li>
                  <li><strong>Trimestral:</strong> Se resetea cada enero, abril, julio y octubre</li>
                  <li><strong>Semestral:</strong> Se resetea en enero y julio</li>
                  <li><strong>Anual:</strong> Se resetea cada enero</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

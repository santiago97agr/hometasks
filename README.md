# HomeTasks - Gestión de Tareas Domésticas

Una aplicación web para gestionar tareas domésticas con diferentes periodicidades (semanal, mensual, trimestral, semestral y anual).

## 🚀 Características

- **Gestión de tareas** con múltiples periodicidades
- **Organización por áreas** de la casa
- **Dashboard visual** con progreso de completado
- **Autenticación segura** con NextAuth.js
- **Base de datos** Turso (SQLite)
- **Diseño responsive** con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: Turso (SQLite) con Drizzle ORM
- **Autenticación**: NextAuth.js v4
- **UI**: Tailwind CSS + shadcn/ui
- **Validación**: Zod
- **Estado**: TanStack Query (React Query)
- **Lenguaje**: TypeScript

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- Una cuenta en [Turso](https://turso.tech/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/santiago97agr/hometasks.git
cd hometasks
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Turso Database
TURSO_DATABASE_URL="libsql://tu-database-url.turso.io"
TURSO_AUTH_TOKEN="tu-auth-token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aleatorio-muy-largo"

# Opcional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Configurar la base de datos

```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:push
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Uso

### 1. Registro de usuario

- Ve a `/register` para crear una nueva cuenta
- Completa el formulario con tu nombre, email y contraseña

### 2. Gestión de áreas

- Crea áreas como "Cocina", "Baño", "Sala", etc.
- Asigna colores para organizar visualmente tus tareas

### 3. Crear tareas

- Define tareas con diferentes periodicidades:
  - **Semanal**: Se repite cada semana
  - **Mensual**: Se repite en una semana específica del mes
  - **Trimestral**: Se repite en meses específicos cada trimestre
  - **Semestral**: Se repite cada 6 meses
  - **Anual**: Se repite cada año

### 4. Dashboard

- Ve el progreso de tus tareas organizadas por periodicidad
- Marca tareas como completadas
- Visualiza el progreso con barras de estado

## 🗄️ Estructura de la Base de Datos

### Usuarios (`users`)
- `id`: Identificador único
- `email`: Email del usuario
- `name`: Nombre del usuario
- `passwordHash`: Hash de la contraseña
- `createdAt`, `updatedAt`: Timestamps

### Áreas (`areas`)
- `id`: Identificador único
- `name`: Nombre del área
- `color`: Color hexadecimal para identificación visual
- `userId`: Referencia al usuario propietario

### Tareas (`tasks`)
- `id`: Identificador único
- `name`: Nombre de la tarea
- `description`: Descripción opcional
- `frequency`: Periodicidad (WEEKLY, MONTHLY, QUARTERLY, BIANNUAL, ANNUAL)
- `areaId`: Referencia al área (opcional)
- `userId`: Referencia al usuario propietario
- `startDate`: Fecha de inicio
- `weekOfMonth`: Semana del mes (para tareas mensuales)
- `monthsArray`: Meses específicos (JSON array para tareas periódicas)
- `isActive`: Estado activo/inactivo

### Completaciones (`completions`)
- `id`: Identificador único
- `taskId`: Referencia a la tarea
- `completedAt`: Timestamp de completado
- `period`: Período específico (ej: "2024-W03", "2024-01", "2024-Q1")

## 🔧 Scripts disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint

# Base de datos
npm run db:generate    # Generar migraciones
npm run db:push       # Aplicar migraciones
npm run db:migrate    # Ejecutar migraciones
npm run db:studio     # Abrir Drizzle Studio
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push

### Otras plataformas

Asegúrate de:
- Configurar las variables de entorno
- Ejecutar `npm run build` 
- Servir los archivos estáticos generados

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

Desarrollado con ❤️ usando Next.js y Turso

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').default('#3B82F6'),
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  frequency: text('frequency', { 
    enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'] 
  }).notNull(),
  areaId: text('area_id').references(() => areas.id),
  userId: text('user_id').references(() => users.id).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  weekOfMonth: integer('week_of_month'), // 1-4 para mensual
  monthsArray: text('months_array'), // JSON ["1","4","7","10"] trimestral
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const completions = sqliteTable('completions', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  period: text('period').notNull(), // "2024-W03", "2024-01", "2024-Q1"
});

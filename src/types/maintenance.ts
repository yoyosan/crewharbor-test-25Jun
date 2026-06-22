export type MaintenanceTask = {
  id: number
  date: string
  type: string
  description: string
  technician: string
  status: 'pending' | 'completed' | 'overdue'
  dueDate: string
}

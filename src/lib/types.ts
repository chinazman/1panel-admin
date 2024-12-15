export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Host {
  id: string
  name: string
  url: string
  entranceCode: string
  username: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface HostUser {
  id: string
  userId: string
  hostId: string
  createdAt: Date
} 
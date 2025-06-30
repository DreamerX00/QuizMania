export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export interface User {
  id: string
  email: string
  name?: string
  role: Role
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser extends User {
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  role?: Role
}

export interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>> | (() => void)
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
  loading: boolean
} 
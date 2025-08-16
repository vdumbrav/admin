// import { Navigate } from '@tanstack/react-router'
// import { useAuth } from '@/hooks/use-auth'

// export function RoleGuard({
//   role = 'admin',
//   children,
// }: {
//   role?: 'admin' | 'user'
//   children: React.ReactNode
// }) {
//   const { user, isLoading } = useAuth()
//   if (isLoading) return null
//   if (!user) return <Navigate to='/auth' />
//   if (role === 'admin' && !user.roles.includes('admin'))
//     return <>Access denied</>
//   return <>{children}</>
// }

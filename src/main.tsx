import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from '@/lib/queryClient'
import { oidcConfig } from '@/lib/oidc'
import { auth } from '@/lib/auth-singleton'
import './index.css'
import '@/styles/theme.css'

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AuthSync() {
  const ctx = useAuth()
  useEffect(() => {
    auth.set(ctx)
  }, [ctx])
  return null
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <AuthSync />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>,
  )
}

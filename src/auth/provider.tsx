import React from 'react';
import { AuthProvider } from 'react-oidc-context';
import { TokenAutoRenew } from './TokenAutoRenew';
import { oidcConfig } from './oidc';

export const AppAuthProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <AuthProvider {...oidcConfig}>
      <TokenAutoRenew />
      {children}
    </AuthProvider>
  );
};

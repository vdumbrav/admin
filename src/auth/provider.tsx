import React from 'react';
import { AuthProvider } from 'react-oidc-context';
import { TokenAutoRenew } from './TokenAutoRenew';
import { oidcConfig } from './oidc';

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AuthProvider {...oidcConfig}>
      <TokenAutoRenew />
      {children}
    </AuthProvider>
  );
};

/**
 * Empty Layout
 * Just renders children without any wrapper
 */

export function EmptyLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return <>{children}</>;
}


// token key per role
export function getTokenKey(role: string): string {
  return `${role}_token`;
}

// active role for the current tab
export function setActiveRole(role: string) {
  sessionStorage.setItem('active_role', role);
}

export function getActiveRole(): string | null {
  return sessionStorage.getItem('active_role');
}

export function clearActiveRole() {
  sessionStorage.removeItem('active_role');
}

// token key per role
export function getTokenKey(role: string): string {
  return `${role}_token`;
}

// active role for the current tab
export function setActiveRole(role: string) {
  localStorage.setItem('active_role', role);
}

export function getActiveRole(): string | null {
  return localStorage.getItem('active_role');
}

export function clearActiveRole() {
  localStorage.removeItem('active_role');
}
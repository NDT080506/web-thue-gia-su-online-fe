const USER_KEY = "hoc-cung-current-user";

export function getCurrentUser() {
  const storedUser = sessionStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function setCurrentUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  sessionStorage.removeItem(USER_KEY);
}
function normalizePath(pathname = window.location.pathname) {
  if (!pathname) return '/';
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

export function isProtectedPage(pathname = window.location.pathname) {
  return normalizePath(pathname) === '/';
}

export function isCallbackPage() {
  return false;
}

function getAdobeIMS() {
  return window.adobeIMS;
}

export async function isAuthenticated() {
  return Boolean(getAdobeIMS()?.isSignedInUser?.());
}

export async function login() {
  getAdobeIMS()?.signIn?.();
}

export async function logout() {
  getAdobeIMS()?.signOut?.();
}

export async function getUser() {
  const ims = getAdobeIMS();

  if (!ims?.isSignedInUser?.()) return null;

  const profile = ims.getUserProfile?.() || ims.profile || null;
  if (profile) return profile;

  const accessToken = ims.getAccessToken?.();
  if (!accessToken) return null;

  return { name: 'Signed in' };
}

export async function handleLoginCallback() {
  return null;
}

export async function requireAuth() {
  return isAuthenticated();
}

export async function initializeAuth() {
  return true;
}

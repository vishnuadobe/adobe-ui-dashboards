import { getMetadata } from './aem.js';
import adobeImsConfig from './adobe-ims-config.js';
import {
  getUserProfile,
  handleRedirectCallback,
  isAuthenticated as hasAdobeSession,
  login as startAdobeLogin,
  logout as startAdobeLogout,
} from './adobe-ims-client.js';

function normalizePath(pathname) {
  if (!pathname) return '/';
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

function getCallbackPath() {
  return normalizePath(new URL(adobeImsConfig.redirectUri).pathname);
}

function getCurrentRelativeUri() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function isProtectedPage(doc = document, locationObj = window.location) {
  const authMeta = getMetadata('auth', doc).trim().toLowerCase();
  const currentPath = normalizePath(locationObj.pathname);
  const protectedPaths = (adobeImsConfig.protectedPaths || []).map(normalizePath);

  return authMeta === 'required' || protectedPaths.includes(currentPath);
}

export function isCallbackPage(pathname = window.location.pathname) {
  return normalizePath(pathname) === getCallbackPath();
}

export async function isAuthenticated() {
  return hasAdobeSession();
}

export async function login(originalUri = getCurrentRelativeUri()) {
  await startAdobeLogin(originalUri);
}

export async function logout() {
  await startAdobeLogout();
}

export async function getUser() {
  const authenticated = await hasAdobeSession();

  if (!authenticated) return null;

  try {
    return await getUserProfile();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to fetch Adobe IMS user profile', error);
    return null;
  }
}

export async function handleLoginCallback() {
  const { originalUri } = await handleRedirectCallback();
  window.location.replace(originalUri);
}

export async function requireAuth(originalUri = getCurrentRelativeUri()) {
  const authenticated = await isAuthenticated();
  if (authenticated) return true;

  await login(originalUri);
  return false;
}

export async function initializeAuth(doc = document) {
  if (isCallbackPage()) {
    try {
      await handleLoginCallback();
    } catch (error) {
      doc.body?.setAttribute('data-auth-error', 'callback');
      // eslint-disable-next-line no-console
      console.error('Adobe IMS callback handling failed', error);
    }

    return false;
  }

  if (!isProtectedPage(doc)) {
    return true;
  }

  return requireAuth();
}

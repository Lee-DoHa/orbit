import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { Platform } from 'react-native';

// MMKV for native, in-memory/localStorage for web
let storageBackend: {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

if (Platform.OS !== 'web') {
  try {
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'orbit-auth' });
    storageBackend = {
      getItem: (key: string) => mmkv.getString(key) ?? null,
      setItem: (key: string, value: string) => mmkv.set(key, value),
      removeItem: (key: string) => mmkv.delete(key),
      clear: () => mmkv.clearAll(),
    };
  } catch {
    const map = new Map<string, string>();
    storageBackend = {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => { map.set(key, value); },
      removeItem: (key) => { map.delete(key); },
      clear: () => map.clear(),
    };
  }
} else {
  storageBackend = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
  };
}

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '';

// Lazy-init: only create pool when env vars are configured
let _userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool {
  if (!_userPool) {
    if (!USER_POOL_ID || !CLIENT_ID) {
      throw new Error('Cognito not configured. Set EXPO_PUBLIC_COGNITO_USER_POOL_ID and EXPO_PUBLIC_COGNITO_CLIENT_ID.');
    }
    _userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      Storage: storageBackend as Storage,
    });
  }
  return _userPool;
}

export function isConfigured(): boolean {
  return !!USER_POOL_ID && !!CLIENT_ID;
}

export async function signUp(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];
    getUserPool().signUp(email, password, attributes, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getUserPool() });
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function signIn(email: string, password: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getUserPool() });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    });
  });
}

export async function signOut(): Promise<void> {
  try {
    const user = getUserPool().getCurrentUser();
    if (user) user.signOut();
  } catch {
    // Pool not configured
  }
  storageBackend.clear();
}

export async function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) return reject(new Error('Not configured'));
    let user: CognitoUser | null;
    try {
      user = getUserPool().getCurrentUser();
    } catch {
      return reject(new Error('Pool error'));
    }
    if (!user) return reject(new Error('Not authenticated'));

    try {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        try {
          if (err || !session) return reject(err || new Error('No session'));
          if (!session.isValid()) return reject(new Error('Session expired'));
          const token = session.getIdToken()?.getJwtToken();
          if (!token) return reject(new Error('No token'));
          resolve(token);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function getCurrentUser(): CognitoUser | null {
  try {
    return getUserPool().getCurrentUser();
  } catch {
    return null;
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    if (!isConfigured()) return false;
    const user = getUserPool().getCurrentUser();
    if (!user) return false;
    await getAccessToken();
    return true;
  } catch {
    // Clear corrupted storage on session check failure
    try { storageBackend.clear(); } catch {}
    return false;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getUserPool() });
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
      inputVerificationCode: () => resolve(),
    });
  });
}

export async function confirmNewPassword(email: string, code: string, newPassword: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getUserPool() });
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export async function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getUserPool() });
    user.resendConfirmationCode((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

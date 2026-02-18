import type { LoginCredentials, SignupPayload, SocialProvider } from '../types';

export async function loginWithEmail(_payload: LoginCredentials): Promise<void> {
  throw new Error('AUTH_NOT_CONNECTED');
}

export async function signupWithEmail(_payload: SignupPayload): Promise<void> {
  throw new Error('AUTH_NOT_CONNECTED');
}

export async function loginWithSocial(_provider: SocialProvider): Promise<void> {
  throw new Error('AUTH_NOT_CONNECTED');
}

export async function logout(): Promise<void> {
  throw new Error('AUTH_NOT_CONNECTED');
}

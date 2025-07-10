import { getAccessToken } from './getAccessToken'

export async function triggerGoogleLogin(scopes: string[]) {
  try {
    const token = await getAccessToken(scopes)

    if (!token) {
      throw new Error('Login failed: No token received')
    }

    return true
  } catch (error) {
    throw error
  }
}
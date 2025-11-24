const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '/api' : 'https://api.studydash.app')

type ApiErrorPayload = {
  message?: string | string[]
}

const parseErrorMessage = (payload?: ApiErrorPayload) => {
  if (Array.isArray(payload?.message)) {
    return payload?.message.join(', ')
  }
  if (typeof payload?.message === 'string') {
    return payload.message
  }
  return 'Nastala neočekávaná chyba. Zkuste to prosím znovu.'
}

const request = async <T>(path: string, init: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  const data = await response.json().catch(() => undefined)

  if (!response.ok) {
    throw new Error(parseErrorMessage(data as ApiErrorPayload))
  }

  return data as T
}

type LoginResponse = {
  data?: {
    accessToken?: string
  }
}

type RegisterResponse = {
  data?: {
    id: number
    username: string
    email: string
  }
}

export const loginRequest = async (payload: { username: string; password: string }) => {
  const data = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const accessToken = data?.data?.accessToken

  if (!accessToken) {
    throw new Error('Chybí přístupový token')
  }

  return accessToken
}

export const registerRequest = async (payload: {
  username: string
  password: string
  email: string
}) => {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const apiBaseUrl = API_BASE_URL

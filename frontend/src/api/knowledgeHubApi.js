import axios from 'axios'

const HUB_TOKEN_KEY = 'knowledgeHubToken'
const HUB_USER_KEY = 'knowledgeHubUser'

export const knowledgeHubApi = axios.create({
  baseURL: 'http://localhost:5000/api/hub',
})

knowledgeHubApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(HUB_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const setHubSession = (token) => {
  if (token) localStorage.setItem(HUB_TOKEN_KEY, token)
}

export const setHubUser = (user) => {
  if (user) localStorage.setItem(HUB_USER_KEY, JSON.stringify(user))
}

export const clearHubSession = () => {
  localStorage.removeItem(HUB_TOKEN_KEY)
  localStorage.removeItem(HUB_USER_KEY)
}

export const getHubToken = () => localStorage.getItem(HUB_TOKEN_KEY)

export const getHubUser = () => {
  try {
    const raw = localStorage.getItem(HUB_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
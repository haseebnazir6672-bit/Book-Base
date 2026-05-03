import { createContext, useContext, useState } from 'react'
import {
  clearHubSession,
  getHubToken,
  getHubUser,
  knowledgeHubApi,
  setHubSession,
  setHubUser,
} from '../api/knowledgeHubApi'

const KnowledgeHubContext = createContext(null)

export function KnowledgeHubProvider({ children }) {
  const [hubToken, setHubToken] = useState(getHubToken())
  const [hubUser, setHubUserState] = useState(getHubUser())

  const login = (token, user) => {
    setHubSession(token)
    setHubUser(user)
    setHubToken(token)
    setHubUserState(user)
  }

  const logout = () => {
    clearHubSession()
    setHubToken(null)
    setHubUserState(null)
  }

  const value = {
    hubToken,
    hubUser,
    knowledgeHubApi,
    login,
    logout,
  }

  return (
    <KnowledgeHubContext.Provider value={value}>
      {children}
    </KnowledgeHubContext.Provider>
  )
}

export function useKnowledgeHub() {
  const context = useContext(KnowledgeHubContext)
  if (!context) {
    throw new Error('useKnowledgeHub must be used within a KnowledgeHubProvider')
  }
  return context
}

import type { CoupleGroup, User } from '../types'

const getStorageKeyForUser = (username: string) => ({
  USER: `expense_tracker_user_${username}`,
  GROUPS: `expense_tracker_groups_${username}`
})

export const saveUser = (user: User) => {
  const STORAGE_KEYS = getStorageKeyForUser(user.username)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  console.log(`Saved user data for ${user.username}:`, user)
}

export const getUser = (username: string): User | null => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  const user = localStorage.getItem(STORAGE_KEYS.USER)
  console.log(`Retrieved user data for ${username}:`, user)
  return user ? JSON.parse(user) : null
}

export const saveGroup = (group: CoupleGroup, username: string) => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  const groups = getGroups(username)
  const existingGroupIndex = groups.findIndex(g => g.id === group.id)
  
  if (existingGroupIndex >= 0) {
    groups[existingGroupIndex] = group
  } else {
    groups.push(group)
  }
  
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups))
  console.log(`Saved group for ${username}:`, groups)
}

export const getGroups = (username: string): CoupleGroup[] => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  const groups = localStorage.getItem(STORAGE_KEYS.GROUPS)
  console.log(`Retrieved groups for ${username}:`, groups)
  return groups ? JSON.parse(groups) : []
}

export const getGroupById = (id: string, username: string): CoupleGroup | null => {
  console.log(`Searching for group ${id} in ${username}'s storage`)
  const groups = getGroups(username)
  const group = groups.find(g => g.id === id)
  console.log(`Found group:`, group)
  return group || null
}

export const clearStorage = (username: string) => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.GROUPS)
  console.log(`Cleared storage for ${username}`)
}

export const getAllGroups = (): CoupleGroup[] => {
  const allGroups: CoupleGroup[] = []
  console.log('Searching all localStorage for groups...')
  
  // Get all keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('expense_tracker_groups_')) {
      try {
        const groupsData = localStorage.getItem(key)
        console.log(`Found groups key: ${key}`, groupsData)
        if (groupsData) {
          const groups = JSON.parse(groupsData)
          if (Array.isArray(groups)) {
            allGroups.push(...groups)
            console.log(`Added groups from ${key}:`, groups)
          }
        }
      } catch (error) {
        console.error(`Error parsing groups data for ${key}:`, error)
      }
    }
  }
  
  console.log('All available groups:', allGroups)
  return allGroups
}

export const debugStorage = () => {
  console.group('Storage Debug Info')
  console.log('Current domain:', window.location.hostname)
  console.log('All localStorage keys:')
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      allKeys.push(key)
      const value = localStorage.getItem(key)
      console.log(`${key}:`, value)
      if (key.includes('groups')) {
        try {
          console.log(`Parsed ${key}:`, JSON.parse(value || '[]'))
        } catch (e) {
          console.error(`Error parsing ${key}:`, e)
        }
      }
    }
  }
  console.log('All keys:', allKeys)
  console.groupEnd()
} 
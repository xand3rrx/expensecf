import type { CoupleGroup, User } from '../types'

const getStorageKeyForUser = (username: string) => ({
  USER: `expense_tracker_user_${username}`,
  GROUPS: `expense_tracker_groups_${username}`
})

export const saveUser = (user: User) => {
  const STORAGE_KEYS = getStorageKeyForUser(user.username)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export const getUser = (username: string): User | null => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  const user = localStorage.getItem(STORAGE_KEYS.USER)
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
  return groups ? JSON.parse(groups) : []
}

export const getGroupById = (id: string, username: string): CoupleGroup | null => {
  const groups = getGroups(username)
  return groups.find(g => g.id === id) || null
}

export const clearStorage = (username: string) => {
  const STORAGE_KEYS = getStorageKeyForUser(username)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.GROUPS)
}

export const getAllGroups = (): CoupleGroup[] => {
  const allGroups: CoupleGroup[] = []
  
  // Get all keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('expense_tracker_groups_')) {
      try {
        const groupsData = localStorage.getItem(key)
        if (groupsData) {
          const groups = JSON.parse(groupsData)
          if (Array.isArray(groups)) {
            allGroups.push(...groups)
          }
        }
      } catch (error) {
        console.error('Error parsing groups data:', error)
      }
    }
  }
  
  console.log('All available groups:', allGroups)
  return allGroups
}

export const debugStorage = () => {
  console.log('All localStorage keys:')
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
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
} 
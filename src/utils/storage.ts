import type { CoupleGroup, User } from '../types'

const STORAGE_KEYS = {
  SHARED_GROUPS: 'expense_tracker_all_groups',
  getUserKey: (username: string) => `expense_tracker_user_${username}`,
  getCurrentUserKey: () => 'current_user'
}

// Initialize storage on app start
export const initializeStorage = () => {
  const groupsStr = localStorage.getItem(STORAGE_KEYS.SHARED_GROUPS)
  if (!groupsStr || groupsStr === 'null') {
    localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify([]))
    console.log('Initialized groups storage with empty array')
  }
}

export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.getUserKey(user.username), JSON.stringify(user))
  console.log(`Saved user data for ${user.username}:`, user)
}

export const getUser = (username: string): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.getUserKey(username))
  console.log(`Retrieved user data for ${username}:`, user)
  return user ? JSON.parse(user) : null
}

export const saveGroup = (group: CoupleGroup) => {
  const existingGroupsStr = localStorage.getItem(STORAGE_KEYS.SHARED_GROUPS)
  let existingGroups: CoupleGroup[] = []
  
  if (existingGroupsStr && existingGroupsStr !== 'null') {
    try {
      existingGroups = JSON.parse(existingGroupsStr)
      if (!Array.isArray(existingGroups)) {
        existingGroups = []
      }
    } catch (error) {
      console.error('Error parsing existing groups:', error)
      existingGroups = []
    }
  }
  
  const existingGroupIndex = existingGroups.findIndex(g => g.id === group.id)
  
  if (existingGroupIndex >= 0) {
    existingGroups[existingGroupIndex] = group
  } else {
    existingGroups.push(group)
  }
  
  localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify(existingGroups))
  console.log('Saved group:', group)
  console.log('All groups:', existingGroups)
}

export const getGroups = (): CoupleGroup[] => {
  const groupsStr = localStorage.getItem(STORAGE_KEYS.SHARED_GROUPS)
  console.log('Raw groups data:', groupsStr)
  
  if (!groupsStr || groupsStr === 'null') {
    console.log('No groups found, returning empty array')
    return []
  }
  
  try {
    const groups = JSON.parse(groupsStr)
    if (Array.isArray(groups)) {
      console.log('Retrieved groups:', groups)
      return groups
    } else {
      console.log('Groups data is not an array, returning empty array')
      return []
    }
  } catch (error) {
    console.error('Error parsing groups:', error)
    return []
  }
}

export const getUserGroups = (username: string): CoupleGroup[] => {
  const allGroups = getGroups()
  const userGroups = allGroups.filter(group => group.members.includes(username))
  console.log(`Retrieved groups for ${username}:`, userGroups)
  return userGroups
}

export const getGroupById = (id: string): CoupleGroup | null => {
  console.log(`Searching for group ${id}`)
  const groups = getGroups()
  const group = groups.find(g => g.id === id)
  console.log(`Found group:`, group)
  return group || null
}

export const clearStorage = (username: string) => {
  localStorage.removeItem(STORAGE_KEYS.getUserKey(username))
  console.log(`Cleared storage for ${username}`)
}

export const getAllGroups = (): CoupleGroup[] => {
  return getGroups()
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
      if (key === STORAGE_KEYS.SHARED_GROUPS) {
        try {
          if (value && value !== 'null') {
            console.log(`Parsed groups:`, JSON.parse(value))
          } else {
            console.log('Groups storage is null or empty')
          }
        } catch (e) {
          console.error(`Error parsing groups:`, e)
        }
      }
    }
  }
  console.log('All keys:', allKeys)
  console.groupEnd()
} 
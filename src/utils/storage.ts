import type { CoupleGroup, User } from '../types'
import * as cloudflareStorage from './cloudflareStorage'

const STORAGE_KEYS = {
  SHARED_GROUPS: 'expense_tracker_all_groups',
  getUserKey: (username: string) => `expense_tracker_user_${username}`,
  getCurrentUserKey: () => 'current_user'
}

// Initialize storage on app start
export const initializeStorage = async () => {
  // Fetch latest groups from Cloudflare
  const cloudflareGroups = await cloudflareStorage.getGroups()
  localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify(cloudflareGroups))
  console.log('Initialized groups storage with Cloudflare data:', cloudflareGroups)
}

export const saveUser = async (user: User) => {
  localStorage.setItem(STORAGE_KEYS.getUserKey(user.username), JSON.stringify(user))
  await cloudflareStorage.saveUser(user)
  console.log(`Saved user data for ${user.username}:`, user)
}

export const getUser = async (username: string): Promise<User | null> => {
  // Try Cloudflare first
  const cloudflareUser = await cloudflareStorage.getUser(username)
  if (cloudflareUser) {
    // Update local storage
    localStorage.setItem(STORAGE_KEYS.getUserKey(username), JSON.stringify(cloudflareUser))
    console.log(`Retrieved user data for ${username} from Cloudflare:`, cloudflareUser)
    return cloudflareUser
  }

  // Fallback to local storage
  const user = localStorage.getItem(STORAGE_KEYS.getUserKey(username))
  console.log(`Retrieved user data for ${username} from local storage:`, user)
  return user ? JSON.parse(user) : null
}

export const saveGroup = async (group: CoupleGroup) => {
  // Save to Cloudflare first
  await cloudflareStorage.saveGroup(group)
  
  // Then update local storage with latest data from Cloudflare
  const cloudflareGroups = await cloudflareStorage.getGroups()
  localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify(cloudflareGroups))
  console.log('Saved group and synced with Cloudflare:', group)
  console.log('All groups:', cloudflareGroups)
}

export const saveGroups = async (groups: CoupleGroup[]) => {
  // Save each group to Cloudflare
  for (const group of groups) {
    await cloudflareStorage.saveGroup(group)
  }
  
  // Update local storage with latest data
  const cloudflareGroups = await cloudflareStorage.getGroups()
  localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify(cloudflareGroups))
  console.log('Saved all groups and synced with Cloudflare:', cloudflareGroups)
}

export const getGroups = async (): Promise<CoupleGroup[]> => {
  // Always fetch latest from Cloudflare
  const cloudflareGroups = await cloudflareStorage.getGroups()
  
  // Update local storage
  localStorage.setItem(STORAGE_KEYS.SHARED_GROUPS, JSON.stringify(cloudflareGroups))
  console.log('Retrieved groups from Cloudflare:', cloudflareGroups)
  return cloudflareGroups
}

export const getUserGroups = async (username: string): Promise<CoupleGroup[]> => {
  const allGroups = await getGroups()
  const userGroups = allGroups.filter(group => group.members.includes(username))
  console.log(`Retrieved groups for ${username}:`, userGroups)
  return userGroups
}

export const getGroupById = async (id: string): Promise<CoupleGroup | null> => {
  console.log(`Searching for group ${id}`)
  const group = await cloudflareStorage.getGroupById(id)
  console.log(`Found group:`, group)
  return group
}

export const clearStorage = async (username: string) => {
  localStorage.removeItem(STORAGE_KEYS.getUserKey(username))
  await cloudflareStorage.clearStorage(username)
  console.log(`Cleared storage for ${username}`)
}

export const getAllGroups = async (): Promise<CoupleGroup[]> => {
  return await getGroups()
}

export const debugStorage = async () => {
  console.group('Storage Debug Info')
  console.log('Current domain:', window.location.hostname)
  
  // Debug Cloudflare KV storage
  await cloudflareStorage.debugStorage()
  
  // Debug local storage
  console.log('All localStorage keys:')
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      allKeys.push(key)
      const value = localStorage.getItem(key)
      console.log(`${key}:`, value)
    }
  }
  console.log('All keys:', allKeys)
  console.groupEnd()
} 
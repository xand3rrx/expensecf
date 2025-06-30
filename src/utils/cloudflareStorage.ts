import type { CoupleGroup, User } from '../types'

// Cloudflare KV namespace (you'll need to create this in your Cloudflare dashboard)
const KV_NAMESPACE = 'EXPENSE_TRACKER_KV'

interface KVResponse {
  success: boolean
  data?: any
  error?: string
}

// Helper function to make KV API calls
async function kvRequest(action: string, key: string, value?: any): Promise<KVResponse> {
  try {
    const response = await fetch('/api/kv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        key,
        value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('KV request failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const saveUser = async (user: User): Promise<boolean> => {
  const result = await kvRequest('put', `user:${user.username}`, user)
  if (result.success) {
    console.log(`Saved user data for ${user.username}:`, user)
  } else {
    console.error(`Failed to save user ${user.username}:`, result.error)
  }
  return result.success
}

export const getUser = async (username: string): Promise<User | null> => {
  const result = await kvRequest('get', `user:${username}`)
  if (result.success && result.data) {
    console.log(`Retrieved user data for ${username}:`, result.data)
    return result.data
  } else {
    console.log(`No user data found for ${username}`)
    return null
  }
}

export const saveGroup = async (group: CoupleGroup): Promise<boolean> => {
  // Get existing groups
  const existingGroupsResult = await kvRequest('get', 'groups')
  let existingGroups: CoupleGroup[] = []
  
  if (existingGroupsResult.success && existingGroupsResult.data) {
    existingGroups = existingGroupsResult.data
  }
  
  // Update or add the group
  const existingGroupIndex = existingGroups.findIndex(g => g.id === group.id)
  if (existingGroupIndex >= 0) {
    existingGroups[existingGroupIndex] = group
  } else {
    existingGroups.push(group)
  }
  
  // Save updated groups
  const result = await kvRequest('put', 'groups', existingGroups)
  if (result.success) {
    console.log('Saved group:', group)
    console.log('All groups:', existingGroups)
  } else {
    console.error('Failed to save group:', result.error)
  }
  return result.success
}

export const getGroups = async (): Promise<CoupleGroup[]> => {
  const result = await kvRequest('get', 'groups')
  if (result.success && result.data) {
    console.log('Retrieved groups:', result.data)
    return result.data
  } else {
    console.log('No groups found, returning empty array')
    return []
  }
}

export const getUserGroups = async (username: string): Promise<CoupleGroup[]> => {
  const allGroups = await getGroups()
  const userGroups = allGroups.filter(group => group.members.includes(username))
  console.log(`Retrieved groups for ${username}:`, userGroups)
  return userGroups
}

export const getGroupById = async (id: string): Promise<CoupleGroup | null> => {
  console.log(`Searching for group ${id}`)
  const groups = await getGroups()
  const group = groups.find(g => g.id === id)
  console.log(`Found group:`, group)
  return group || null
}

export const clearStorage = async (username: string): Promise<boolean> => {
  const result = await kvRequest('delete', `user:${username}`)
  if (result.success) {
    console.log(`Cleared storage for ${username}`)
  } else {
    console.error(`Failed to clear storage for ${username}:`, result.error)
  }
  return result.success
}

export const getAllGroups = async (): Promise<CoupleGroup[]> => {
  return await getGroups()
}

export const debugStorage = async (): Promise<void> => {
  console.group('Cloudflare KV Storage Debug Info')
  console.log('Current domain:', window.location.hostname)
  
  // Get all groups
  const groups = await getGroups()
  console.log('All groups:', groups)
  
  // Get all users (this would require listing all keys, which might not be available)
  console.log('Note: User listing not available in this implementation')
  
  console.groupEnd()
} 
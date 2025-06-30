import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react'
import type { User, CoupleGroup } from '../types'
import { getUser, saveUser, debugStorage } from '../utils/storage'

const JoinGroup = () => {
  const [groupId, setGroupId] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get current username
    const storedUser = localStorage.getItem('current_user')
    const username = storedUser ? JSON.parse(storedUser).username : null

    if (!username) {
      toast({
        title: 'Error',
        description: 'No username found. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/')
      return
    }

    const user = getUser(username)
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not found. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/')
      return
    }

    // Check if user is already in a group
    if (user.groupId) {
      toast({
        title: 'Already in a group',
        description: 'You are already a member of a group. You cannot join another group.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/dashboard')
      return
    }

    const trimmedGroupId = groupId.trim()
    if (!trimmedGroupId) {
      toast({
        title: 'Invalid group ID',
        description: 'Please enter a group ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Search for the group in all users' storage
    let foundGroup: CoupleGroup | null = null
    let groupOwner: string | null = null

    // Debug: Log the group ID we're looking for
    console.log('Looking for group ID:', trimmedGroupId)

    // Search through localStorage for the group
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('expense_tracker_groups_')) {
        try {
          const groupsData = localStorage.getItem(key)
          console.log('Checking key:', key, 'with data:', groupsData)
          
          if (groupsData) {
            const groups = JSON.parse(groupsData)
            console.log('Parsed groups:', groups)
            
            // Handle both array and single group cases
            const groupsArray = Array.isArray(groups) ? groups : [groups]
            const group = groupsArray.find(g => g.id === trimmedGroupId)
            
            if (group) {
              foundGroup = group
              groupOwner = key.replace('expense_tracker_groups_', '')
              console.log('Found matching group:', group, 'owned by:', groupOwner)
              break
            }
          }
        } catch (error) {
          console.error('Error parsing groups data for key', key, ':', error)
        }
      }
    }

    // Debug: Log what we found
    console.log('Search results - Found group:', foundGroup)
    console.log('Search results - Group owner:', groupOwner)

    if (!foundGroup || !groupOwner) {
      toast({
        title: 'Group not found',
        description: 'No group found with this ID. Please check the ID and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (foundGroup.members.includes(user.username)) {
      toast({
        title: 'Already a member',
        description: 'You are already a member of this group',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (foundGroup.members.length >= 2) {
      toast({
        title: 'Group is full',
        description: 'This group already has two members',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Update group with new member
    const updatedGroup: CoupleGroup = {
      ...foundGroup,
      members: [...foundGroup.members, user.username]
    }

    // Update user with group ID
    const updatedUser: User = {
      ...user,
      groupId: foundGroup.id
    }

    // Save the updated group for both users
    localStorage.setItem(`expense_tracker_groups_${groupOwner}`, JSON.stringify([updatedGroup]))
    localStorage.setItem(`expense_tracker_groups_${username}`, JSON.stringify([updatedGroup]))

    // Save user data
    saveUser(updatedUser)
    localStorage.setItem('current_user', JSON.stringify(updatedUser))

    // Debug: Log final state
    console.log('Updated group:', updatedGroup)
    debugStorage()
    
    toast({
      title: 'Success',
      description: 'You have successfully joined the group!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    navigate('/dashboard')
  }

  return (
    <Box maxW="md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading>Join Existing Group</Heading>
        <Text>Enter the group ID shared by your partner to join their group.</Text>
        <Text fontSize="sm" color="gray.600">
          Make sure to use the exact ID shared by your partner. The ID is case-sensitive.
        </Text>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Group ID</FormLabel>
              <Input
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Enter group ID"
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">
              Join Group
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default JoinGroup 
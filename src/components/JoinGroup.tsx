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
import { getUser as getUserCloudflare, saveUser as saveUserCloudflare, debugStorage, getGroupById, saveGroup as saveGroupCloudflare, getGroups as getGroupsCloudflare } from '../utils/cloudflareStorage'
import { saveUser as saveUserLocal, saveGroup as saveGroupLocal } from '../utils/storage'

const JoinGroup = () => {
  const [groupId, setGroupId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
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

      const user = await getUserCloudflare(username)
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

      // Debug current state
      console.group('Join Group Debug')
      console.log('Current user:', username)
      console.log('Attempting to join group:', trimmedGroupId)
      await debugStorage()

      // Find the group
      const foundGroup = await getGroupById(trimmedGroupId)

      console.log('Search complete')
      console.log('Found group:', foundGroup)
      console.groupEnd()

      if (!foundGroup) {
        toast({
          title: 'Group not found',
          description: 'No group found with this ID. Please check the ID and try again. Make sure you\'re using the exact ID that was shared with you.',
          status: 'error',
          duration: 8000,
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

      // Save to Cloudflare KV
      const [groupSaved, userSaved] = await Promise.all([
        saveGroupCloudflare(updatedGroup),
        saveUserCloudflare(updatedUser)
      ])

      if (!groupSaved || !userSaved) {
        throw new Error('Failed to save group or user data')
      }

      // Save to local storage
      saveUserLocal(updatedUser)
      saveGroupLocal(updatedGroup)
      localStorage.setItem('current_user', JSON.stringify(updatedUser))

      // Sync all groups from Cloudflare KV to local storage
      const allGroups = await getGroupsCloudflare()
      localStorage.setItem('expense_tracker_all_groups', JSON.stringify(allGroups))

      // Debug: Log final state
      console.log('Updated group:', updatedGroup)
      await debugStorage()
      
      toast({
        title: 'Success',
        description: 'You have successfully joined the group!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error joining group:', error)
      toast({
        title: 'Error',
        description: 'Failed to join group. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
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
                disabled={isLoading}
              />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="blue" 
              width="full"
              isLoading={isLoading}
              loadingText="Joining Group..."
            >
              Join Group
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default JoinGroup 
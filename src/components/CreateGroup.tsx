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
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'
import type { User, CoupleGroup } from '../types'
import { saveUser as saveUserCloudflare, saveGroup, debugStorage } from '../utils/cloudflareStorage'
import { saveUser as saveUserLocal } from '../utils/storage'

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('')
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

      if (groupName.trim().length < 3) {
        toast({
          title: 'Invalid group name',
          description: 'Group name must be at least 3 characters long',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      const newGroup: CoupleGroup = {
        id: uuidv4(),
        name: groupName.trim(),
        members: [username],
        expenses: []
      }

      // Update user with group ID
      const updatedUser: User = {
        username,
        groupId: newGroup.id
      }

      // Save to Cloudflare KV
      const [groupSaved, userSaved] = await Promise.all([
        saveGroup(newGroup),
        saveUserCloudflare(updatedUser)
      ])

      if (!groupSaved || !userSaved) {
        throw new Error('Failed to save group or user data')
      }

      // Save to local storage
      saveUserLocal(updatedUser)
      localStorage.setItem('current_user', JSON.stringify(updatedUser))

      // Debug: Log the current storage state
      console.log('Created new group:', newGroup)
      await debugStorage()

      toast({
        title: 'Group Created Successfully',
        description: `Your group ID is: ${newGroup.id}\nShare this ID with your partner to join the group.`,
        status: 'success',
        duration: 10000,
        isClosable: true,
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating group:', error)
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
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
        <Heading>Create a New Group</Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                disabled={isLoading}
              />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="blue" 
              width="full"
              isLoading={isLoading}
              loadingText="Creating Group..."
            >
              Create Group
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default CreateGroup 
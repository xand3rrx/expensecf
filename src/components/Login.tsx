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
  Text,
  useToast,
} from '@chakra-ui/react'
import type { User } from '../types'
import { saveUser, getUser } from '../utils/storage'

const Login = () => {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 3) {
      toast({
        title: 'Invalid username',
        description: 'Username must be at least 3 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Check if user already exists
    const existingUser = getUser(trimmedUsername)
    if (existingUser) {
      // If user exists, just log them in
      saveUser(existingUser)
      localStorage.setItem('current_user', JSON.stringify(existingUser))
    } else {
      // Create new user
      const user: User = {
        username: trimmedUsername,
        groupId: null,
      }
      saveUser(user)
      localStorage.setItem('current_user', JSON.stringify(user))
    }
    
    navigate('/dashboard')
  }

  return (
    <Box maxW="md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Couple Expense Tracker</Heading>
        <Text textAlign="center">Enter your username to continue</Text>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">
              Continue
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default Login 
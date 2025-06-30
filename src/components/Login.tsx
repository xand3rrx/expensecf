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
import { saveUser, getUser } from '../utils/cloudflareStorage'

const Login = () => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
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
      const existingUser = await getUser(trimmedUsername)
      if (existingUser) {
        // If user exists, just log them in
        await saveUser(existingUser)
        localStorage.setItem('current_user', JSON.stringify(existingUser))
      } else {
        // Create new user
        const user: User = {
          username: trimmedUsername,
          groupId: null,
        }
        await saveUser(user)
        localStorage.setItem('current_user', JSON.stringify(user))
      }
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error during login:', error)
      toast({
        title: 'Error',
        description: 'Failed to log in. Please try again.',
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
                disabled={isLoading}
              />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="blue" 
              width="full"
              isLoading={isLoading}
              loadingText="Logging in..."
            >
              Continue
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default Login 
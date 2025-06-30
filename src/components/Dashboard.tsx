import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Divider,
  Input,
  InputGroup,
  InputRightElement,
  useClipboard,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import type { User, CoupleGroup } from '../types'
import { getUser, getGroupById, saveUser, saveGroup, getGroups } from '../utils/storage'
import AddExpense from './AddExpense'

const Dashboard = () => {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [group, setGroup] = useState<CoupleGroup | null>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const { hasCopied, onCopy } = useClipboard(group?.id || '')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  const loadGroupData = () => {
    // Get username from URL or localStorage
    const params = new URLSearchParams(window.location.search)
    const urlUsername = params.get('username')
    const storedUser = localStorage.getItem('current_user')
    const currentUsername = urlUsername || (storedUser ? JSON.parse(storedUser).username : null)

    if (!currentUsername) {
      navigate('/')
      return
    }

    setUsername(currentUsername)
    const currentUser = getUser(currentUsername)
    if (!currentUser) {
      navigate('/')
      return
    }
    setUser(currentUser)

    if (currentUser.groupId) {
      const userGroup = getGroupById(currentUser.groupId, currentUsername)
      setGroup(userGroup)
    }
  }

  useEffect(() => {
    loadGroupData()
  }, [navigate])

  const handleCreateGroup = () => {
    navigate('/create-group')
  }

  const handleJoinGroup = () => {
    navigate('/join-group')
  }

  const handleLeaveGroup = () => {
    if (!user || !group || !username) return

    // Remove user from group
    const updatedGroup = {
      ...group,
      members: group.members.filter(member => member !== user.username)
    }

    // Update or remove group based on remaining members
    const groups = getGroups(username)
    if (updatedGroup.members.length === 0) {
      // If no members left, remove the group
      const filteredGroups = groups.filter(g => g.id !== group.id)
      localStorage.setItem(`expense_tracker_groups_${username}`, JSON.stringify(filteredGroups))
    } else {
      // Update the group with remaining member
      saveGroup(updatedGroup, username)
    }

    // Update user
    const updatedUser = {
      ...user,
      groupId: null
    }
    saveUser(updatedUser)
    
    toast({
      title: 'Left Group',
      description: 'You have successfully left the group',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })

    setGroup(null)
    setUser(updatedUser)
    onClose()
  }

  if (!user) {
    return null
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Heading>Welcome, {user.username}!</Heading>

        {!group ? (
          <VStack spacing={4}>
            <Text>You're not part of any group yet.</Text>
            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={handleCreateGroup}>
                Create a New Group
              </Button>
              <Button colorScheme="green" onClick={handleJoinGroup}>
                Join Existing Group
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <HStack width="100%" justify="space-between">
              <Text fontSize="xl">
                Group: {group.name}
              </Text>
              <Button colorScheme="red" variant="outline" onClick={onOpen}>
                Leave Group
              </Button>
            </HStack>
            <Text>
              Members: {group.members.join(', ')}
            </Text>

            <Box width="100%" p={4} borderWidth={1} borderRadius="md" bg="gray.50">
              <Text mb={2} fontWeight="bold">Group ID (Share this with your partner):</Text>
              <InputGroup>
                <Input
                  value={group.id}
                  isReadOnly
                  bg="white"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={onCopy}>
                    {hasCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
            
            <Divider />
            
            <Box width="100%">
              <Heading size="md" mb={4}>Add New Expense</Heading>
              <AddExpense onExpenseAdded={loadGroupData} />
            </Box>

            <Divider />

            <Box width="100%">
              <Heading size="md" mb={4}>Expense History</Heading>
              {group.expenses.length === 0 ? (
                <Text>No expenses recorded yet.</Text>
              ) : (
                <VStack spacing={2} align="stretch">
                  {group.expenses.map(expense => (
                    <Box
                      key={expense.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      shadow="sm"
                    >
                      <Text fontWeight="bold">{expense.description}</Text>
                      <Text>Amount: ${expense.amount}</Text>
                      <Text>Category: {expense.category}</Text>
                      <Text>Paid by: {expense.paidBy}</Text>
                      <Text>Date: {new Date(expense.date).toLocaleDateString()}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        )}
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Leave Group
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You will lose access to the group's expense history.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleLeaveGroup} ml={3}>
                Leave Group
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Dashboard 
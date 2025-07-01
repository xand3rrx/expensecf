import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
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
  Badge,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react'
import type { User, CoupleGroup } from '../types'
import { getUser, getGroupById, saveUser, saveGroup, getGroups, saveGroups } from '../utils/storage'

const REFRESH_INTERVAL = 5000 // Refresh every 5 seconds

const Dashboard = () => {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [group, setGroup] = useState<CoupleGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { hasCopied, onCopy } = useClipboard(group?.id || '')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  const loadGroupData = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('current_user')
      const currentUser = storedUser ? JSON.parse(storedUser) : null

      if (!currentUser) {
        navigate('/')
        return
      }

      setUsername(currentUser.username)
      setUser(currentUser)

      if (currentUser.groupId) {
        const userGroup = await getGroupById(currentUser.groupId)
        if (userGroup) {
          setGroup(userGroup)
        }
      }
    } catch (error) {
      console.error('Error loading group data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load group data. Please refresh the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [navigate, toast])

  useEffect(() => {
    loadGroupData()
    
    // Set up auto-refresh
    const intervalId = setInterval(loadGroupData, REFRESH_INTERVAL)
    
    return () => clearInterval(intervalId)
  }, [loadGroupData])

  const handleCreateGroup = () => {
    navigate('/create-group')
  }

  const handleJoinGroup = () => {
    navigate('/join-group')
  }

  const handleLeaveGroup = async () => {
    if (!user || !group || !username) return

    try {
      setIsLoading(true)
      
      // Remove user from group
      const updatedGroup = {
        ...group,
        members: group.members.filter(member => member !== user.username)
      }

      // Update or remove group based on remaining members
      const groups = await getGroups()
      if (updatedGroup.members.length === 0) {
        // If no members left, remove the group
        const filteredGroups = groups.filter((g: CoupleGroup) => g.id !== group.id)
        await saveGroups(filteredGroups)
      } else {
        // Update the group with remaining member
        await saveGroup(updatedGroup)
      }

      // Update user
      const updatedUser = {
        ...user,
        groupId: null
      }
      await saveUser(updatedUser)
      localStorage.setItem('current_user', JSON.stringify(updatedUser))
      
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
    } catch (error) {
      console.error('Error leaving group:', error)
      toast({
        title: 'Error',
        description: 'Failed to leave group. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <Spinner size="xl" color="var(--primary)" />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  // Calculate total expenses and additions
  const totals = group?.expenses.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc.expenses += transaction.amount
    } else {
      acc.additions += transaction.amount
    }
    return acc
  }, { expenses: 0, additions: 0 }) || { expenses: 0, additions: 0 }

  return (
    <Box pb="64px">
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="var(--card)" borderColor="var(--border)">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Leave Group
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You will need to be invited again to rejoin this group.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleLeaveGroup} ml={3} isLoading={isLoading}>
                Leave Group
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <VStack spacing={6} align="stretch">
        <Heading size="lg" mb={2}>Welcome, {user.username}!</Heading>

        {!group ? (
          <Box className="card">
            <VStack spacing={4}>
              <Text>You're not part of any group yet.</Text>
              <HStack spacing={4}>
                <Button
                  className="button button-primary"
                  onClick={handleCreateGroup}
                >
                  Create Group
                </Button>
                <Button
                  className="button button-secondary"
                  onClick={handleJoinGroup}
                >
                  Join Group
                </Button>
              </HStack>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={4}>
            <Box className="card">
              <HStack justify="space-between" mb={2}>
                <Heading size="md">{group.name}</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={onOpen}
                >
                  Leave
                </Button>
              </HStack>
              <Text fontSize="sm" color="var(--muted-foreground)">
                Members: {group.members.join(', ')}
              </Text>
            </Box>

            <SimpleGrid columns={2} spacing={4} w="full">
              <Box className="card">
                <Text fontSize="sm" color="var(--muted-foreground)">Total Expenses</Text>
                <Text fontSize="xl" fontWeight="bold" color="var(--destructive)">
                  ${totals.expenses.toFixed(2)}
                </Text>
              </Box>
              <Box className="card">
                <Text fontSize="sm" color="var(--muted-foreground)">Total Additions</Text>
                <Text fontSize="xl" fontWeight="bold" color="#22c55e">
                  ${totals.additions.toFixed(2)}
                </Text>
              </Box>
            </SimpleGrid>

            <Box className="card">
              <Text fontSize="sm" mb={2} color="var(--muted-foreground)">Group ID (Share with partner)</Text>
              <InputGroup size="sm">
                <Input
                  value={group.id}
                  isReadOnly
                  pr="4.5rem"
                  className="input"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={onCopy}
                    className="button button-secondary"
                  >
                    {hasCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            {group.expenses.length > 0 && (
              <Box className="card">
                <Heading size="sm" mb={3}>Recent Transactions</Heading>
                <VStack spacing={3} align="stretch">
                  {[...group.expenses]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(expense => (
                      <HStack key={expense.id} justify="space-between" p={2} className="card">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{expense.description}</Text>
                          <Text fontSize="xs" color="var(--muted-foreground)">
                            by {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Badge
                            className={`badge badge-${expense.type}`}
                          >
                            {expense.type}
                          </Badge>
                          <Text
                            fontWeight="bold"
                            color={expense.type === 'expense' ? 'var(--destructive)' : '#22c55e'}
                          >
                            ${expense.amount.toFixed(2)}
                          </Text>
                        </HStack>
                      </HStack>
                    ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default Dashboard 
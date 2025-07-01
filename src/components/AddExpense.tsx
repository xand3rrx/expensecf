import { useState } from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'
import type { Expense, CoupleGroup } from '../types'
import { getUser, getGroupById, saveGroup } from '../utils/storage'
import { saveGroup as saveGroupCloudflare } from '../utils/cloudflareStorage'

interface AddExpenseProps {
  onExpenseAdded: () => void
}

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Transportation',
  'Other'
]

const AddExpense: React.FC<AddExpenseProps> = ({ onExpenseAdded }) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get current user from local storage
    const storedUser = localStorage.getItem('current_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null

    if (!currentUser || !currentUser.groupId) {
      toast({
        title: 'Error',
        description: 'You must be in a group to add expenses',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const group = getGroupById(currentUser.groupId)
    if (!group) {
      toast({
        title: 'Error',
        description: 'Group not found',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const newExpense: Expense = {
      id: uuidv4(),
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      paidBy: currentUser.username,
      date: new Date().toISOString(),
    }

    const updatedGroup: CoupleGroup = {
      ...group,
      expenses: [...group.expenses, newExpense]
    }

    // Save to both storages
    await saveGroupCloudflare(updatedGroup)
    saveGroup(updatedGroup)
    
    setDescription('')
    setAmount('')
    setCategory(EXPENSE_CATEGORIES[0])
    onExpenseAdded()

    toast({
      title: 'Success',
      description: 'Expense added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <NumberInput min={0} value={amount} onChange={(value) => setAmount(value)}>
            <NumberInputField placeholder="How much did you spend?" />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="blue" width="full">
          Add Expense
        </Button>
      </VStack>
    </form>
  )
}

export default AddExpense 
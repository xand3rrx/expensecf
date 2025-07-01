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
  RadioGroup,
  Radio,
  Stack,
  Heading,
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

const ADDITION_CATEGORIES = [
  'Salary',
  'Bonus',
  'Gift',
  'Investment',
  'Other'
]

const AddExpense: React.FC<AddExpenseProps> = ({ onExpenseAdded }) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [type, setType] = useState<'expense' | 'addition'>('expense')
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get current user from local storage
    const storedUser = localStorage.getItem('current_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null

    if (!currentUser || !currentUser.groupId) {
      toast({
        title: 'Error',
        description: 'You must be in a group to add transactions',
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

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount greater than 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const newTransaction: Expense = {
      id: uuidv4(),
      description: description.trim(),
      amount: parsedAmount,
      category,
      paidBy: currentUser.username,
      date: new Date().toISOString(),
      type
    }

    const updatedGroup: CoupleGroup = {
      ...group,
      expenses: [...group.expenses, newTransaction]
    }

    // Save to both storages
    await saveGroupCloudflare(updatedGroup)
    saveGroup(updatedGroup)
    
    setDescription('')
    setAmount('')
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : ADDITION_CATEGORIES[0])
    onExpenseAdded()

    toast({
      title: 'Success',
      description: `${type === 'expense' ? 'Expense' : 'Addition'} added successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  // Update category options when type changes
  const handleTypeChange = (newType: 'expense' | 'addition') => {
    setType(newType)
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : ADDITION_CATEGORIES[0])
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <Heading size="md">Add Transaction</Heading>

        <FormControl isRequired>
          <FormLabel>Transaction Type</FormLabel>
          <RadioGroup value={type} onChange={handleTypeChange}>
            <Stack direction="row">
              <Radio value="expense">Expense</Radio>
              <Radio value="addition">Addition</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'expense' ? "What did you spend on?" : "What's the source of this addition?"}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <NumberInput min={0} value={amount} onChange={(value) => setAmount(value)}>
            <NumberInputField placeholder="Enter amount" />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {(type === 'expense' ? EXPENSE_CATEGORIES : ADDITION_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormControl>

        <Button 
          type="submit" 
          colorScheme={type === 'expense' ? "red" : "green"} 
          width="full"
        >
          Add {type === 'expense' ? 'Expense' : 'Addition'}
        </Button>
      </VStack>
    </form>
  )
}

export default AddExpense 
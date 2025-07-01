import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from '@chakra-ui/react'
import type { Analytics as AnalyticsType, CoupleGroup } from '../types'
import { getGroupById } from '../utils/storage'

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null)
  const bgColor = useColorModeValue('white', 'gray.700')

  useEffect(() => {
    const calculateAnalytics = () => {
      const storedUser = localStorage.getItem('current_user')
      const currentUser = storedUser ? JSON.parse(storedUser) : null

      if (!currentUser?.groupId) return null

      const group = getGroupById(currentUser.groupId)
      if (!group) return null

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return date.toISOString().slice(0, 7) // YYYY-MM format
      })

      const analytics: AnalyticsType = {
        totalExpenses: 0,
        totalAdditions: 0,
        netBalance: 0,
        expensesByCategory: {},
        expensesByMember: {},
        additionsByMember: {},
        recentTransactions: [],
        monthlyTotals: lastSixMonths.map(month => ({ month, expenses: 0, additions: 0 }))
      }

      // Initialize member totals
      group.members.forEach(member => {
        analytics.expensesByMember[member] = 0
        analytics.additionsByMember[member] = 0
      })

      // Process all transactions
      group.expenses.forEach(transaction => {
        const amount = transaction.amount
        const isExpense = transaction.type === 'expense'
        const month = transaction.date.slice(0, 7)
        const monthlyTotal = analytics.monthlyTotals.find(m => m.month === month)

        if (isExpense) {
          analytics.totalExpenses += amount
          analytics.expensesByMember[transaction.paidBy] += amount
          analytics.expensesByCategory[transaction.category] = 
            (analytics.expensesByCategory[transaction.category] || 0) + amount
          if (monthlyTotal) monthlyTotal.expenses += amount
        } else {
          analytics.totalAdditions += amount
          analytics.additionsByMember[transaction.paidBy] += amount
          if (monthlyTotal) monthlyTotal.additions += amount
        }
      })

      analytics.netBalance = analytics.totalAdditions - analytics.totalExpenses
      analytics.recentTransactions = [...group.expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      return analytics
    }

    const result = calculateAnalytics()
    setAnalytics(result)
  }, [])

  if (!analytics) {
    return (
      <Box p={4}>
        <Text>No analytics available. Make sure you're in a group and have some transactions.</Text>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Financial Analytics</Heading>

        {/* Overview Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Expenses</StatLabel>
            <StatNumber color="red.500">${analytics.totalExpenses.toFixed(2)}</StatNumber>
          </Stat>
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Additions</StatLabel>
            <StatNumber color="green.500">${analytics.totalAdditions.toFixed(2)}</StatNumber>
          </Stat>
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Net Balance</StatLabel>
            <StatNumber color={analytics.netBalance >= 0 ? "green.500" : "red.500"}>
              ${analytics.netBalance.toFixed(2)}
            </StatNumber>
          </Stat>
        </Grid>

        {/* Expenses by Category */}
        <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Expenses by Category</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Category</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>% of Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(analytics.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <Tr key={category}>
                    <Td>{category}</Td>
                    <Td isNumeric>${amount.toFixed(2)}</Td>
                    <Td isNumeric>
                      {((amount / analytics.totalExpenses) * 100).toFixed(1)}%
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>

        {/* Member Contributions */}
        <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Member Contributions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Member</Th>
                <Th isNumeric>Expenses</Th>
                <Th isNumeric>Additions</Th>
                <Th isNumeric>Net</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.keys(analytics.expensesByMember).map(member => {
                const expenses = analytics.expensesByMember[member]
                const additions = analytics.additionsByMember[member]
                const net = additions - expenses
                return (
                  <Tr key={member}>
                    <Td>{member}</Td>
                    <Td isNumeric color="red.500">${expenses.toFixed(2)}</Td>
                    <Td isNumeric color="green.500">${additions.toFixed(2)}</Td>
                    <Td isNumeric color={net >= 0 ? "green.500" : "red.500"}>
                      ${net.toFixed(2)}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>

        {/* Monthly Trends */}
        <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Monthly Trends</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Month</Th>
                <Th isNumeric>Expenses</Th>
                <Th isNumeric>Additions</Th>
                <Th isNumeric>Net</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analytics.monthlyTotals.map(({ month, expenses, additions }) => (
                <Tr key={month}>
                  <Td>{new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Td>
                  <Td isNumeric color="red.500">${expenses.toFixed(2)}</Td>
                  <Td isNumeric color="green.500">${additions.toFixed(2)}</Td>
                  <Td isNumeric color={(additions - expenses) >= 0 ? "green.500" : "red.500"}>
                    ${(additions - expenses).toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Recent Transactions */}
        <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Recent Transactions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th>Paid By</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analytics.recentTransactions.map(transaction => (
                <Tr key={transaction.id}>
                  <Td>{new Date(transaction.date).toLocaleDateString()}</Td>
                  <Td>{transaction.description}</Td>
                  <Td>{transaction.category}</Td>
                  <Td>{transaction.paidBy}</Td>
                  <Td isNumeric color={transaction.type === 'expense' ? "red.500" : "green.500"}>
                    ${transaction.amount.toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  )
}

export default Analytics 
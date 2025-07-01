import { useLocation, useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { RiHome5Fill, RiHome5Line } from 'react-icons/ri'
import { IoAddCircle, IoAddCircleOutline } from 'react-icons/io5'
import { IoStatsChartSharp, IoStatsChart } from 'react-icons/io5'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  // Don't show on login page
  if (currentPath === '/') return null

  const navItems = [
    {
      label: 'Home',
      path: '/dashboard',
      icon: currentPath === '/dashboard' ? RiHome5Fill : RiHome5Line,
    },
    {
      label: 'Add',
      path: '/add-expense',
      icon: currentPath === '/add-expense' ? IoAddCircle : IoAddCircleOutline,
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: currentPath === '/analytics' ? IoStatsChartSharp : IoStatsChart,
    },
  ]

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="64px"
      bg="var(--card)"
      borderTop="1px solid var(--border)"
      backdropFilter="blur(10px)"
      zIndex={1000}
    >
      <HStack
        height="100%"
        justify="space-around"
        align="center"
        maxW="480px"
        margin="0 auto"
        px={4}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path
          return (
            <VStack
              key={item.path}
              spacing={0.5}
              cursor="pointer"
              onClick={() => navigate(item.path)}
              color={isActive ? 'var(--primary)' : 'var(--muted-foreground)'}
              transition="all 0.2s"
              _hover={{ color: 'var(--primary)' }}
            >
              <Icon size={24} />
              <Text
                fontSize="xs"
                fontWeight={isActive ? "600" : "400"}
              >
                {item.label}
              </Text>
            </VStack>
          )
        })}
      </HStack>
    </Box>
  )
}

export default BottomNav 
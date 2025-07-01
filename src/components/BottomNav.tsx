import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaHome, FaChartBar, FaPlus } from 'react-icons/fa'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const activeColor = useColorModeValue('blue.500', 'blue.200')
  const inactiveColor = useColorModeValue('gray.600', 'gray.400')

  const navItems = [
    { icon: FaHome, label: 'Home', path: '/dashboard' },
    { icon: FaPlus, label: 'Add', path: '/add-transaction' },
    { icon: FaChartBar, label: 'Analytics', path: '/analytics' },
  ]

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav bar */}
      <Box h="70px" />
      
      {/* Fixed bottom navigation */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={bgColor}
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
        zIndex={1000}
      >
        <Flex justify="space-around" align="center" h="60px">
          {navItems.map(({ icon, label, path }) => (
            <Flex
              key={path}
              direction="column"
              align="center"
              justify="center"
              flex={1}
              py={2}
              cursor="pointer"
              color={location.pathname === path ? activeColor : inactiveColor}
              onClick={() => navigate(path)}
              transition="all 0.2s"
              _hover={{ color: activeColor }}
            >
              <Icon as={icon} boxSize={5} mb={1} />
              <Text fontSize="xs" fontWeight="medium">{label}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </>
  )
}

export default BottomNav 
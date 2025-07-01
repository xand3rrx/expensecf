import { ChakraProvider, Container, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CreateGroup from './components/CreateGroup'
import JoinGroup from './components/JoinGroup'
import Analytics from './components/Analytics'
import AddExpense from './components/AddExpense'
import BottomNav from './components/BottomNav'
import { initializeStorage } from './utils/storage'

// Wrapper component to conditionally render BottomNav
const AppContent = () => {
  const location = useLocation()
  const showBottomNav = !['/'].includes(location.pathname)

  return (
    <>
      <Box 
        pb={showBottomNav ? "70px" : 0} // Add padding when BottomNav is shown
        minH="100vh"
        bg="gray.50"
        _dark={{ bg: "gray.900" }}
      >
        <Container 
          maxW="container.sm" 
          py={4}
          px={4}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/join-group" element={<JoinGroup />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/add-transaction" element={<AddExpense onExpenseAdded={() => {}} />} />
          </Routes>
        </Container>
      </Box>
      {showBottomNav && <BottomNav />}
    </>
  )
}

function App() {
  useEffect(() => {
    initializeStorage()
  }, [])

  return (
    <ChakraProvider>
      <Router>
        <AppContent />
      </Router>
    </ChakraProvider>
  )
}

export default App

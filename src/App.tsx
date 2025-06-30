import { ChakraProvider, Container } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CreateGroup from './components/CreateGroup'
import JoinGroup from './components/JoinGroup'

function App() {
  return (
    <ChakraProvider>
      <Container maxW="container.lg" py={8}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/join-group" element={<JoinGroup />} />
          </Routes>
        </Router>
      </Container>
    </ChakraProvider>
  )
}

export default App

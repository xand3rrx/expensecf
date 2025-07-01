import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CreateGroup from './components/CreateGroup'
import JoinGroup from './components/JoinGroup'
import AddExpense from './components/AddExpense'
import Analytics from './components/Analytics'
import BottomNav from './components/BottomNav'

// Extend Chakra UI theme with dark mode and custom colors
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'var(--background)',
        color: 'var(--foreground)',
      },
    },
  },
  colors: {
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'var(--radius)',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'var(--radius)',
          bg: 'var(--input)',
          borderColor: 'var(--border)',
          _focus: {
            borderColor: 'var(--ring)',
            boxShadow: '0 0 0 2px var(--ring)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'var(--card)',
          borderRadius: 'var(--radius)',
          borderColor: 'var(--border)',
        },
      },
    },
  },
})

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/join-group" element={<JoinGroup />} />
            <Route path="/add-expense" element={<AddExpense onExpenseAdded={() => {}} />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </ChakraProvider>
  )
}

export default App

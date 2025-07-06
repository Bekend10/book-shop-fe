// Mock API cho development
export const mockAuth = {
  // Mock users database
  users: [
    {
      id: 1,
      email: 'admin@bookshop.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      phone: '0123456789'
    },
    {
      id: 2,
      email: 'user@bookshop.com',
      password: 'user123',
      name: 'Normal User',
      role: 'user',
      phone: '0987654321'
    }
  ],

  // Mock login
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const user = mockAuth.users.find(u => 
      u.email === credentials.email && u.password === credentials.password
    )
    
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác')
    }
    
    const token = 'mock-jwt-token-' + Date.now()
    const { password, ...userWithoutPassword } = user
    
    return {
      token,
      user: userWithoutPassword
    }
  },

  // Mock register
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const existingUser = mockAuth.users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Email đã được sử dụng')
    }
    
    const newUser = {
      id: mockAuth.users.length + 1,
      ...userData,
      role: 'user'
    }
    
    mockAuth.users.push(newUser)
    
    const token = 'mock-jwt-token-' + Date.now()
    const { password, ...userWithoutPassword } = newUser
    
    return {
      token,
      user: userWithoutPassword
    }
  },

  // Mock profile
  getProfile: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new Error('Token không hợp lệ')
    }
    
    // Return first user for demo
    const { password, ...user } = mockAuth.users[0]
    return user
  }
}

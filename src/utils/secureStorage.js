// Simple encryption/decryption utility for localStorage
// Note: Đây chỉ là obfuscation, không phải encryption thật sự
// Cho security cao hơn, nên sử dụng thư viện crypto chuyên dụng

const SECRET_KEY = 'BookShop2025_SecretKey_!@#$%^&*()'

// Base64 encoding với key rotation
function simpleEncrypt(text) {
  if (!text) return ''
  
  try {
    // Chuyển đổi text thành array of char codes
    const textBytes = Array.from(text).map((char, i) => 
      char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
    )
    
    // Convert to base64
    return btoa(String.fromCharCode(...textBytes))
  } catch (error) {
    console.error('Encryption failed:', error)
    return text // Fallback to original text
  }
}

// Base64 decoding với key rotation
function simpleDecrypt(encryptedText) {
  if (!encryptedText) return ''
  
  try {
    // Decode from base64
    const decoded = atob(encryptedText)
    
    // Convert back to original text
    const originalText = Array.from(decoded).map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('')
    
    return originalText
  } catch (error) {
    console.error('Decryption failed:', error)
    return '' // Return empty if decryption fails
  }
}

// Advanced encryption using Web Crypto API (cho browsers hiện đại)
class SecureStorage {
  constructor() {
    this.algorithm = 'AES-GCM'
    this.keyLength = 256
    this.ivLength = 12
  }

  // Generate encryption key from password
  async generateKey(password) {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password + SECRET_KEY)
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    // Derive actual encryption key
    const salt = encoder.encode('BookShop2025Salt')
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Encrypt text using AES-GCM
  async encrypt(text, userPassword = 'default') {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      
      const key = await this.generateKey(userPassword)
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength))
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Advanced encryption failed:', error)
      // Fallback to simple encryption
      return simpleEncrypt(text)
    }
  }

  // Decrypt text using AES-GCM
  async decrypt(encryptedText, userPassword = 'default') {
    try {
      if (!encryptedText) return ''
      
      // Convert from base64
      const combined = new Uint8Array(
        Array.from(atob(encryptedText)).map(char => char.charCodeAt(0))
      )
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, this.ivLength)
      const encrypted = combined.slice(this.ivLength)
      
      const key = await this.generateKey(userPassword)
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encrypted
      )
      
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Advanced decryption failed:', error)
      // Fallback to simple decryption
      return simpleDecrypt(encryptedText)
    }
  }

  // Check if Web Crypto API is available
  isSupported() {
    return typeof crypto !== 'undefined' && 
           crypto.subtle && 
           typeof crypto.subtle.encrypt === 'function'
  }
}

// Main encryption functions
const secureStorage = new SecureStorage()

export async function encryptCredential(text, userEmail = '') {
  if (secureStorage.isSupported()) {
    return await secureStorage.encrypt(text, userEmail)
  } else {
    // Fallback for older browsers
    return simpleEncrypt(text)
  }
}

export async function decryptCredential(encryptedText, userEmail = '') {
  if (secureStorage.isSupported()) {
    return await secureStorage.decrypt(encryptedText, userEmail)
  } else {
    // Fallback for older browsers
    return simpleDecrypt(encryptedText)
  }
}

// Utility functions for localStorage with encryption
export const secureLocalStorage = {
  async setItem(key, value, userEmail = '') {
    try {
      const encrypted = await encryptCredential(value, userEmail)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Secure setItem failed:', error)
      // Don't store if encryption fails
    }
  },

  async getItem(key, userEmail = '') {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      
      return await decryptCredential(encrypted, userEmail)
    } catch (error) {
      console.error('Secure getItem failed:', error)
      // Remove corrupted data
      localStorage.removeItem(key)
      return null
    }
  },

  removeItem(key) {
    localStorage.removeItem(key)
  },

  // Clear all remembered credentials
  clearCredentials() {
    localStorage.removeItem('remembered_email')
    localStorage.removeItem('remembered_password_hash')
    localStorage.removeItem('remembered_salt')
  }
}

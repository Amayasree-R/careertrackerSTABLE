import { useCallback, useRef, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

/**
 * Custom hook for enhancing description text with AI
 * Includes debouncing to prevent excessive API calls
 */
export function useDescriptionEnhancer() {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedTexts, setEnhancedTexts] = useState({})
  const debounceTimers = useRef({})

  /**
   * Enhance description text with AI
   * @param {string} id - Unique identifier for this text (e.g., "exp-0-desc")
   * @param {string} rawText - Raw text to enhance
   * @param {object} context - Context information (role, company, targetJobRole)
   * @param {string} section - Section type ("experience" or "achievement")
   * @param {function} onComplete - Callback when enhancement is complete
   */
  const enhanceDescription = useCallback(async (id, rawText, context, section, onComplete) => {
    // Skip if text is too short
    if (!rawText || rawText.trim().length < 10) {
      return
    }

    // Clear existing timer for this ID
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
    }

    // Set new debounced timer
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        setIsEnhancing(true)

        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${API_BASE_URL}/resume/enhance-description`,
          {
            section,
            rawText: rawText.trim(),
            context
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000 // 15 second timeout
          }
        )

        if (response.data.success && response.data.polishedText) {
          // Store enhanced text
          setEnhancedTexts(prev => ({
            ...prev,
            [id]: response.data.polishedText
          }))

          // Call completion callback
          if (onComplete) {
            onComplete(response.data.polishedText)
          }
        }
      } catch (error) {
        console.error('Description enhancement error:', error)
        // Silently fail - don't disrupt user experience
        // Original text will remain in preview
      } finally {
        setIsEnhancing(false)
      }
    }, 800) // 800ms debounce delay

  }, [])

  /**
   * Get enhanced text for a specific ID
   */
  const getEnhancedText = useCallback((id, fallback = '') => {
    return enhancedTexts[id] || fallback
  }, [enhancedTexts])

  /**
   * Clear enhanced text for a specific ID
   */
  const clearEnhancedText = useCallback((id) => {
    setEnhancedTexts(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }, [])

  /**
   * Clear all timers (cleanup)
   */
  const cleanup = useCallback(() => {
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer))
    debounceTimers.current = {}
  }, [])

  return {
    isEnhancing,
    enhanceDescription,
    getEnhancedText,
    clearEnhancedText,
    cleanup
  }
}

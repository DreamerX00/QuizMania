/**
 * AI Service module for QuizMania
 * Handles API calls to DeepSeek, OpenAI, and Gemini for quiz generation
 */

export interface QuizParameters {
  subjects?: string[]
  difficulty: string
  questionCount: number
  apiKey?: string
  provider?: 'openai' | 'deepseek' | 'gemini'
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
}

// Cache for generated quizzes to reduce API calls
const quizCache = new Map<string, QuizData>()

/**
 * Generate a quiz using the DeepSeek API
 */
export const generateQuizWithDeepSeek = async (quizParameters: QuizParameters): Promise<QuizData> => {
  const cacheKey = JSON.stringify({
    provider: 'deepseek',
    subjects: quizParameters.subjects,
    difficulty: quizParameters.difficulty,
    questionCount: quizParameters.questionCount
  })
  
  if (quizCache.has(cacheKey)) {
    console.log("Using cached DeepSeek quiz data")
    return quizCache.get(cacheKey)!
  }

  const apiKey = quizParameters.apiKey
  if (!apiKey) {
    throw new Error('DeepSeek API key not found')
  }

  const prompt = `Generate a quiz with the following parameters:
    - Topic: ${quizParameters.subjects?.join(', ') || 'General'}
    - Difficulty: ${quizParameters.difficulty}
    - Number of questions: ${quizParameters.questionCount}
    - Question type: multiple-choice and true/false
    
    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any explanations, comments, or thinking process outside the JSON.
    The response must be a single JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Quiz Description",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option X",
          "explanation": "Explanation of the correct answer"
        }
      ]
    }

    STRICT FORMATTING RULES:
    1. Each question must have exactly 4 options
    2. Options must be plain text without any prefixes (A), B), etc.)
    3. Options must not contain any special characters (backticks, quotes, etc.)
    4. The correctAnswer must be exactly one of the options provided (exact string match)
    5. Explanations must be plain text without any special formatting
    6. Keep option text concise and clear
    7. Make sure the correct answer is a complete match with one of the options
    8. Do not include any comments or thinking process in the JSON
    9. Ensure all questions are relevant to the topic and difficulty level`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a quiz generation expert who creates high-quality questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DeepSeek API error (${response.status}):`, errorText)
      throw new Error(`DeepSeek API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    let quizData: QuizData
    try {
      const content = data.choices[0].message.content
      quizData = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response as JSON:', parseError)
      throw new Error('Invalid JSON response from DeepSeek API')
    }

    // Validate structure
    if (!quizData.title || !quizData.description || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure in DeepSeek response')
    }

    quizData.questions.forEach((question, index) => {
      if (!question.question || !Array.isArray(question.options) || 
          question.options.length !== 4 || !question.correctAnswer || 
          !question.explanation) {
        throw new Error(`Invalid question structure at index ${index}`)
      }
      question.options.forEach((option, optIndex) => {
        if (/[`'"()]/.test(option)) {
          throw new Error(`Option ${optIndex + 1} in question ${index + 1} contains invalid characters`)
        }
      })
      if (/[`'"()]/.test(question.explanation)) {
        throw new Error(`Explanation in question ${index + 1} contains invalid characters`)
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`Correct answer not found in options for question ${index + 1}`)
      }
    })

    // Cache and return
    quizCache.set(cacheKey, quizData)
    setTimeout(() => quizCache.delete(cacheKey), 24 * 60 * 60 * 1000)
    return quizData
  } catch (error) {
    console.error("Error calling DeepSeek API:", error)
    throw error
  }
}

/**
 * Generate a quiz using the OpenAI API
 */
export const generateQuizWithOpenAI = async (quizParameters: QuizParameters): Promise<QuizData> => {
  const cacheKey = JSON.stringify({
    provider: 'openai',
    subjects: quizParameters.subjects,
    difficulty: quizParameters.difficulty,
    questionCount: quizParameters.questionCount
  })
  
  if (quizCache.has(cacheKey)) {
    console.log("Using cached OpenAI quiz data")
    return quizCache.get(cacheKey)!
  }

  const apiKey = quizParameters.apiKey
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }

  const prompt = `Generate a quiz with the following parameters:
    - Topic: ${quizParameters.subjects?.join(', ') || 'General'}
    - Difficulty: ${quizParameters.difficulty}
    - Number of questions: ${quizParameters.questionCount}
    - Question type: multiple-choice and true/false
    
    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any explanations, comments, or thinking process outside the JSON.
    The response must be a single JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Quiz Description",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option X",
          "explanation": "Explanation of the correct answer"
        }
      ]
    }

    STRICT FORMATTING RULES:
    1. Each question must have exactly 4 options
    2. Options must be plain text without any prefixes (A), B), etc.)
    3. Options must not contain any special characters (backticks, quotes, etc.)
    4. The correctAnswer must be exactly one of the options provided (exact string match)
    5. Explanations must be plain text without any special formatting
    6. Keep option text concise and clear
    7. Make sure the correct answer is a complete match with one of the options
    8. Do not include any comments or thinking process in the JSON
    9. Ensure all questions are relevant to the topic and difficulty level`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a quiz generation expert who creates high-quality questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error (${response.status}):`, errorText)
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    let quizData: QuizData
    try {
      const content = data.choices[0].message.content
      quizData = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError)
      throw new Error('Invalid JSON response from OpenAI API')
    }

    // Validate structure
    if (!quizData.title || !quizData.description || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure in OpenAI response')
    }

    quizData.questions.forEach((question, index) => {
      if (!question.question || !Array.isArray(question.options) || 
          question.options.length !== 4 || !question.correctAnswer || 
          !question.explanation) {
        throw new Error(`Invalid question structure at index ${index}`)
      }
      question.options.forEach((option, optIndex) => {
        if (/[`'"()]/.test(option)) {
          throw new Error(`Option ${optIndex + 1} in question ${index + 1} contains invalid characters`)
        }
      })
      if (/[`'"()]/.test(question.explanation)) {
        throw new Error(`Explanation in question ${index + 1} contains invalid characters`)
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`Correct answer not found in options for question ${index + 1}`)
      }
    })

    // Cache and return
    quizCache.set(cacheKey, quizData)
    setTimeout(() => quizCache.delete(cacheKey), 24 * 60 * 60 * 1000)
    return quizData
  } catch (error) {
    console.error("Error calling OpenAI API:", error)
    throw error
  }
}

/**
 * Get available Gemini models
 */
const getAvailableGeminiModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
    if (!response.ok) {
      throw new Error(`Failed to fetch Gemini models: ${response.status}`)
    }
    const data = await response.json()
    return data.models
      .filter((model: any) => model.name.includes('gemini'))
      .map((model: any) => model.name)
  } catch (error) {
    console.error('Error fetching Gemini models:', error)
    return ['models/gemini-2.0-flash-exp']
  }
}

/**
 * Generate a quiz using the Gemini API
 */
export const generateQuizWithGemini = async (quizParameters: QuizParameters): Promise<QuizData> => {
  const cacheKey = JSON.stringify({
    provider: 'gemini',
    subjects: quizParameters.subjects,
    difficulty: quizParameters.difficulty,
    questionCount: quizParameters.questionCount
  })
  
  if (quizCache.has(cacheKey)) {
    console.log("Using cached Gemini quiz data")
    return quizCache.get(cacheKey)!
  }

  const apiKey = quizParameters.apiKey
  if (!apiKey) {
    throw new Error('Gemini API key not found')
  }

  // Get available models
  const models = await getAvailableGeminiModels(apiKey)
  const model = models.find(m => m.includes('gemini-2.0-flash')) || 'models/gemini-2.0-flash-exp'

  const prompt = `Generate a quiz with the following parameters:
    - Topic: ${quizParameters.subjects?.join(', ') || 'General'}
    - Difficulty: ${quizParameters.difficulty}
    - Number of questions: ${quizParameters.questionCount}
    - Question type: multiple-choice and true/false
    
    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any explanations, comments, or thinking process outside the JSON.
    The response must be a single JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Quiz Description",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option X",
          "explanation": "Explanation of the correct answer"
        }
      ]
    }

    STRICT FORMATTING RULES:
    1. Each question must have exactly 4 options
    2. Options must be plain text without any prefixes (A), B), etc.)
    3. Options must not contain any special characters (backticks, quotes, etc.)
    4. The correctAnswer must be exactly one of the options provided (exact string match)
    5. Explanations must be plain text without any special formatting
    6. Keep option text concise and clear
    7. Make sure the correct answer is a complete match with one of the options
    8. Do not include any comments or thinking process in the JSON
    9. Ensure all questions are relevant to the topic and difficulty level`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error (${response.status}):`, errorText)
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    let quizData: QuizData
    try {
      const content = data.candidates[0].content.parts[0].text
      // Clean up the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response')
      }
      quizData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError)
      throw new Error('Invalid JSON response from Gemini API')
    }

    // Validate structure
    if (!quizData.title || !quizData.description || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure in Gemini response')
    }

    quizData.questions.forEach((question, index) => {
      if (!question.question || !Array.isArray(question.options) || 
          question.options.length !== 4 || !question.correctAnswer || 
          !question.explanation) {
        throw new Error(`Invalid question structure at index ${index}`)
      }
      question.options.forEach((option, optIndex) => {
        if (/[`'"()]/.test(option)) {
          throw new Error(`Option ${optIndex + 1} in question ${index + 1} contains invalid characters`)
        }
      })
      if (/[`'"()]/.test(question.explanation)) {
        throw new Error(`Explanation in question ${index + 1} contains invalid characters`)
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(`Correct answer not found in options for question ${index + 1}`)
      }
    })

    // Cache and return
    quizCache.set(cacheKey, quizData)
    setTimeout(() => quizCache.delete(cacheKey), 24 * 60 * 60 * 1000)
    return quizData
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}

/**
 * Generate quiz with fallback mechanism
 */
export const generateQuizWithFallback = async (
  quizParameters: QuizParameters, 
  preferredProvider: 'openai' | 'deepseek' | 'gemini' = 'openai'
): Promise<QuizData> => {
  const providers = [preferredProvider, 'openai', 'deepseek', 'gemini'].filter((v, i, a) => a.indexOf(v) === i)
  
  for (const provider of providers) {
    try {
      console.log(`Attempting to generate quiz with ${provider}...`)
      
      switch (provider) {
        case 'openai':
          return await generateQuizWithOpenAI(quizParameters)
        case 'deepseek':
          return await generateQuizWithDeepSeek(quizParameters)
        case 'gemini':
          return await generateQuizWithGemini(quizParameters)
        default:
          continue
      }
    } catch (error) {
      console.error(`Failed to generate quiz with ${provider}:`, error)
      if (provider === providers[providers.length - 1]) {
        throw new Error(`All providers failed. Last error: ${error}`)
      }
    }
  }
  
  throw new Error('No providers available')
} 
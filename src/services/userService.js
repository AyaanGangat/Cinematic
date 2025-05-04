import { ref } from 'vue'
import { auth, googleProvider } from '../boot/firebase'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

const currentUser = ref(null)
const reviews = ref([])

// Load user and reviews from localStorage on initialization
const loadFromStorage = () => {
  const storedUser = localStorage.getItem('currentUser')
  const storedReviews = localStorage.getItem('reviews')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  }
  if (storedReviews) {
    reviews.value = JSON.parse(storedReviews)
  }
}

// Save user to localStorage
const saveUserToStorage = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

// Save reviews to localStorage
const saveReviewsToStorage = (reviewsList) => {
  localStorage.setItem('reviews', JSON.stringify(reviewsList))
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Get existing reviews from storage
    const storedReviews = localStorage.getItem('reviews')
    if (storedReviews) {
      reviews.value = JSON.parse(storedReviews)
    }

    // Update current user with existing ratings
    const existingUser = currentUser.value
    currentUser.value = {
      id: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0],
      ratings: existingUser?.ratings || {},
    }
    saveUserToStorage(currentUser.value)
  } else {
    // Keep reviews in storage but clear current user
    currentUser.value = null
    saveUserToStorage(null)
  }
})

// Load from storage on initialization
loadFromStorage()

export const userService = {
  // Register a new user
  async register(email, password) {
    console.log('Attempting to register:', email)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('Registration successful:', userCredential.user)
      return userCredential.user
    } catch (error) {
      console.error('Registration error:', error)
      throw new Error(error.message)
    }
  },

  // Login with email/password
  async login(email, password) {
    console.log('Attempting to login:', email)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('Login successful:', userCredential.user)
      return userCredential.user
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.message)
    }
  },

  // Login with Google
  async loginWithGoogle() {
    console.log('Attempting Google login')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      console.log('Google login successful:', result.user)
      return result.user
    } catch (error) {
      console.error('Google login error:', error)
      throw new Error(error.message)
    }
  },

  // Logout user
  async logout() {
    console.log('Attempting to logout')
    try {
      await signOut(auth)
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error(error.message)
    }
  },

  // Get current user
  getCurrentUser() {
    console.log('Getting current user:', currentUser.value)
    return currentUser.value
  },

  // Add a review
  addReview(mediaId, mediaType, content, isPublic = true, rating = 0) {
    if (!currentUser.value) {
      throw new Error('User not logged in')
    }

    const review = {
      id: Date.now().toString(),
      mediaId,
      mediaType,
      content,
      isPublic,
      rating,
      userId: currentUser.value.id,
      username: currentUser.value.username,
      timestamp: new Date().toISOString(),
    }

    reviews.value.push(review)
    saveReviewsToStorage(reviews.value)
    return review
  },

  // Add a rating
  addRating(mediaId, mediaType, rating) {
    console.log('Attempting to add rating:', { mediaId, mediaType, rating })
    if (!currentUser.value) {
      console.error('Cannot add rating: User not logged in')
      throw new Error('User not logged in')
    }

    currentUser.value.ratings[`${mediaType}-${mediaId}`] = rating
    saveUserToStorage(currentUser.value)
    console.log('Rating added successfully:', rating)
    return rating
  },

  // Get user's rating for a media
  getRating(mediaId, mediaType) {
    console.log('Getting rating for:', { mediaId, mediaType })
    if (!currentUser.value) {
      console.log('No current user, returning null')
      return null
    }
    const rating = currentUser.value.ratings[`${mediaType}-${mediaId}`]
    console.log('Found rating:', rating)
    return rating
  },

  // Get reviews for a specific media
  getReviews(mediaId, mediaType) {
    console.log('Getting reviews for:', { mediaId, mediaType })
    if (!currentUser.value) {
      console.log('No current user, returning empty array')
      return []
    }
    return reviews.value.filter(
      (review) =>
        review.mediaId === mediaId &&
        review.mediaType === mediaType &&
        (review.isPublic || review.userId === currentUser.value.id),
    )
  },

  // Get all reviews for current user
  getAllUserReviews() {
    if (!currentUser.value) return []
    return reviews.value.filter((review) => review.userId === currentUser.value.id)
  },
}

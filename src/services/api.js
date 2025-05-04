const API_KEY = '4e6d8f2b8bfcc5bc6009602d6548a9d1'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export const api = {
  async getTrendingMovies(page = 1) {
    const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`)
    return response.json()
  },

  async getPopularShows(page = 1) {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`)
    return response.json()
  },

  async getMovieDetails(id) {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits,reviews`,
    )
    return response.json()
  },

  async getShowDetails(id) {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos,credits,reviews,seasons`,
    )
    return response.json()
  },

  async searchMovies(query, page = 1) {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return response.json()
  },

  async searchShows(query, page = 1) {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return response.json()
  },

  getPosterUrl(path, size = 'w500') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
  },

  getBackdropUrl(path, size = 'original') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
  },
}

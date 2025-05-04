<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Movies</div>

    <div class="row q-col-gutter-md">
      <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="movie in movies" :key="movie.id">
        <media-card
          :title="movie.title"
          :poster-path="movie.poster_path"
          :rating="movie.vote_average"
          :release-date="movie.release_date"
          :genres="movie.genres"
          @click="goToMovieDetails(movie.id)"
        />
      </div>
    </div>

    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-infinite-scroll @load="onLoad" :offset="250">
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MediaCard from 'components/MediaCard.vue'
import { api } from '../services/api'

export default defineComponent({
  name: 'MoviesPage',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const movies = ref([])
    const loading = ref(false)
    const currentPage = ref(1)

    const fetchMovies = async () => {
      loading.value = true
      try {
        const response = await api.getTrendingMovies(currentPage.value)
        movies.value = [...movies.value, ...response.results]
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        loading.value = false
      }
    }

    const onLoad = async (index, done) => {
      currentPage.value++
      await fetchMovies()
      done()
    }

    const goToMovieDetails = (id) => {
      router.push(`/movie/${id}`)
    }

    onMounted(() => {
      fetchMovies()
    })

    return {
      movies,
      loading,
      onLoad,
      goToMovieDetails
    }
  }
})
</script>

<style scoped>
@media (max-width: 900px) {
  .text-h4 {
    font-size: 1.1rem;
  }
}
@media (max-width: 600px) {
  .q-pa-md {
    padding: 4px !important;
  }
  .text-h4 {
    font-size: 1rem;
  }
  .row.q-col-gutter-md {
    margin-left: 0;
    margin-right: 0;
  }
}
</style> 
<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Featured Content</div>
    
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="text-h5 q-mb-sm">Trending Movies</div>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="movie in trendingMovies" :key="movie.id">
            <media-card
              :title="movie.title"
              :poster-path="movie.poster_path"
              :rating="movie.vote_average"
              :release-date="movie.release_date"
              :genres="movie.genres?.map(g => g.name) || []"
              @click="goToMovieDetails(movie.id)"
            />
          </div>
        </div>
      </div>

      <div class="col-12 q-mt-lg">
        <div class="text-h5 q-mb-sm">Popular TV Shows</div>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="show in popularShows" :key="show.id">
            <media-card
              :title="show.name"
              :poster-path="show.poster_path"
              :rating="show.vote_average"
              :release-date="show.first_air_date"
              :genres="show.genres"
              @click="goToShowDetails(show.id)"
            />
          </div>
        </div>
      </div>
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
  name: 'IndexPage',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const trendingMovies = ref([])
    const popularShows = ref([])
    const currentPage = ref(1)

    const fetchTrendingMovies = async () => {
      try {
        const response = await api.getTrendingMovies(currentPage.value)
        trendingMovies.value = [...trendingMovies.value, ...response.results]
      } catch (error) {
        console.error('Error fetching trending movies:', error)
      }
    }

    const fetchPopularShows = async () => {
      try {
        const response = await api.getPopularShows(currentPage.value)
        popularShows.value = [...popularShows.value, ...response.results]
      } catch (error) {
        console.error('Error fetching popular shows:', error)
      }
    }

    const onLoad = async (index, done) => {
      currentPage.value++
      await Promise.all([fetchTrendingMovies(), fetchPopularShows()])
      done()
    }

    const goToMovieDetails = (id) => {
      router.push({ path: `/movie/${id}` })
    }

    const goToShowDetails = (id) => {
      router.push({ path: `/tv/${id}` })
    }

    onMounted(async () => {
      await Promise.all([fetchTrendingMovies(), fetchPopularShows()])
    })

    return {
      trendingMovies,
      popularShows,
      onLoad,
      goToMovieDetails,
      goToShowDetails
    }
  }
})
</script>

<style scoped>
@media (max-width: 900px) {
  .text-h4, .text-h5 {
    font-size: 1.1rem;
  }
}
@media (max-width: 600px) {
  .q-pa-md {
    padding: 4px !important;
  }
  .text-h4, .text-h5 {
    font-size: 1rem;
  }
  .row.q-col-gutter-md {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>

<template>
  <q-page class="movie-details-page">
    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner-dots color="primary" size="60px" />
    </div>

    <template v-else-if="movie">
      <div class="backdrop" :style="{ backgroundImage: `url(${backdropUrl})` }">
        <div class="backdrop-overlay"></div>
      </div>

      <div class="main-content q-pa-lg flex flex-center">
        <div class="movie-container row q-col-gutter-xl items-start">
          <div class="col-12 col-md-4">
            <q-card class="movie-poster-card shadow-4 rounded-borders">
              <q-img
                :src="posterUrl"
                :ratio="2/3"
                class="rounded-borders"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
                    No Image Available
                  </div>
                </template>
              </q-img>
            </q-card>
          </div>

          <div class="col-12 col-md-8">
            <q-card class="movie-info-card shadow-2 rounded-borders q-pa-lg">
              <div class="text-h3 text-weight-bold q-mb-xs">{{ movie.title }}</div>
              <div class="text-subtitle1 text-grey-8 q-mb-md">
                <q-icon name="star" color="amber" size="sm" />
                {{ movie.vote_average }} ({{ movie.vote_count }} votes)
                <span class="q-mx-sm">|</span>
                {{ movie.release_date }}
                <span class="q-mx-sm">|</span>
                {{ movie.runtime }} minutes
              </div>

              <div class="q-mb-md">
                <q-chip
                  v-for="genre in movie.genres"
                  :key="genre.id"
                  color="primary"
                  text-color="white"
                  class="q-mr-sm q-mb-xs"
                  size="md"
                >
                  {{ genre.name }}
                </q-chip>
              </div>

              <div class="text-h6 q-mb-xs">Overview</div>
              <p class="text-body1 q-mb-lg">{{ movie.overview }}</p>

              <q-separator spaced />

              <div v-if="movie.videos?.results?.length" class="q-mt-lg">
                <div class="text-h6 q-mb-sm flex items-center">
                  <q-icon name="ondemand_video" class="q-mr-sm" /> Trailer
                </div>
                <div class="flex flex-center">
                  <div class="trailer-container">
                    <q-spinner-dots v-if="trailerLoading" color="primary" size="60px" class="trailer-spinner" />
                    <q-video
                      ref="trailerVideoRef"
                      :src="`https://www.youtube.com/embed/${movie.videos.results[0].key}`"
                      class="rounded-borders trailer-video"
                    />
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <div class="q-mt-lg">
                <review-section
                  :media-id="movie.id"
                  media-type="movie"
                  @show-auth="showAuthDialog = true"
                />
              </div>
            </q-card>

            <div v-if="movie.credits?.cast?.length" class="q-mt-xl">
              <div class="text-h6 q-mb-sm">Cast</div>
              <div class="row q-col-gutter-md">
                <div v-for="actor in movie.credits.cast.slice(0, 6)" :key="actor.id" class="col-6 col-sm-4 col-md-3">
                  <q-card flat bordered class="cast-card shadow-1 rounded-borders">
                    <q-img
                      :src="actor.profile_path ? api.getPosterUrl(actor.profile_path, 'w185') : null"
                      :ratio="1"
                      class="rounded-borders"
                    >
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
                          No Image
                        </div>
                      </template>
                    </q-img>
                    <q-card-section>
                      <div class="text-subtitle2 text-weight-medium">{{ actor.name }}</div>
                      <div class="text-caption text-grey">{{ actor.character }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <auth-dialog v-model="showAuthDialog" />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'
import ReviewSection from 'components/ReviewSection.vue'
import AuthDialog from 'components/AuthDialog.vue'

export default defineComponent({
  name: 'MovieDetailsPage',
  components: {
    ReviewSection,
    AuthDialog
  },
  setup() {
    const route = useRoute()
    const movie = ref(null)
    const loading = ref(true)
    const showAuthDialog = ref(false)
    const trailerLoading = ref(true)
    const trailerVideoRef = ref(null)

    // Watch for auth dialog changes
    watch(showAuthDialog, (newValue) => {
      console.log('Auth dialog state changed:', newValue)
    })

    const posterUrl = computed(() => {
      return movie.value?.poster_path ? api.getPosterUrl(movie.value.poster_path) : null
    })

    const backdropUrl = computed(() => {
      return movie.value?.backdrop_path ? api.getBackdropUrl(movie.value.backdrop_path) : null
    })

    const fetchMovieDetails = async () => {
      loading.value = true
      try {
        const data = await api.getMovieDetails(route.params.id)
        movie.value = data
      } catch (error) {
        console.error('Error fetching movie details:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchMovieDetails()
    })

    // Watch for when the trailer iframe loads
    watch(
      () => movie.value?.videos?.results?.[0]?.key,
      async () => {
        trailerLoading.value = true
        await nextTick()
        const iframe = trailerVideoRef.value?.$el?.querySelector('iframe')
        if (iframe) {
          iframe.onload = () => { trailerLoading.value = false }
        }
      }
    )

    return {
      movie,
      loading,
      posterUrl,
      backdropUrl,
      showAuthDialog,
      api,
      trailerLoading,
      trailerVideoRef
    }
  }
})
</script>

<style scoped>
.movie-details-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.movie-container {
  width: 100%;
}

.movie-poster-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.movie-info-card {
  background: #fff;
  border-radius: 16px;
  min-height: 600px;
}

.trailer-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16/9;
  min-height: 320px;
  margin: 0 auto;
  background: #222;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.trailer-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.trailer-video {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: 12px;
}

.cast-card {
  min-height: 220px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.cast-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  transform: scale(1.03);
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400px;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}

@media (max-width: 900px) {
  .main-content {
    padding: 0 8px;
  }
  .movie-info-card {
    min-height: unset;
    padding: 16px !important;
  }
}

@media (max-width: 600px) {
  .movie-details-page {
    padding: 0;
  }
  .main-content {
    padding: 0 2px;
  }
  .movie-info-card {
    padding: 8px !important;
  }
  .trailer-container {
    min-height: 180px;
    max-width: 100vw;
  }
}
</style> 
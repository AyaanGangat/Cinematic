<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Search Results</div>

    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <template v-else>
      <div v-if="searchResults.length === 0" class="text-center q-mt-lg">
        <q-icon name="search_off" size="xl" color="grey" />
        <div class="text-h6 q-mt-md">No results found</div>
      </div>

      <div v-else>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="item in searchResults" :key="item.id">
            <media-card
              :title="item.title || item.name"
              :poster-path="item.poster_path"
              :rating="item.vote_average"
              :release-date="item.release_date || item.first_air_date"
              :genres="item.genres"
              @click="goToDetails(item)"
            />
          </div>
        </div>

        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="5"
          direction-links
          boundary-links
          @update:model-value="onPageChange"
          class="q-mt-lg justify-center"
        />
      </div>
    </template>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from 'components/MediaCard.vue'
import { api } from '../services/api'

export default defineComponent({
  name: 'SearchPage',
  components: {
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const searchResults = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)

    const performSearch = async () => {
      const query = route.query.q
      if (!query) return

      loading.value = true
      try {
        const [moviesResponse, showsResponse] = await Promise.all([
          api.searchMovies(query, currentPage.value),
          api.searchShows(query, currentPage.value)
        ])

        searchResults.value = [
          ...moviesResponse.results.map(item => ({ ...item, type: 'movie' })),
          ...showsResponse.results.map(item => ({ ...item, type: 'tv' }))
        ].sort((a, b) => b.popularity - a.popularity)

        totalPages.value = Math.max(moviesResponse.total_pages, showsResponse.total_pages)
      } catch (error) {
        console.error('Error performing search:', error)
      } finally {
        loading.value = false
      }
    }

    const onPageChange = () => {
      router.push({
        path: '/search',
        query: { ...route.query, page: currentPage.value }
      })
    }

    const goToDetails = (item) => {
      router.push(`/${item.type}/${item.id}`)
    }

    onMounted(() => {
      currentPage.value = parseInt(route.query.page) || 1
      performSearch()
    })

    watch(() => route.query.q, () => {
      currentPage.value = 1
      performSearch()
    })

    return {
      searchResults,
      loading,
      currentPage,
      totalPages,
      onPageChange,
      goToDetails
    }
  }
})
</script> 
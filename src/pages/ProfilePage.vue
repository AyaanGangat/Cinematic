<template>
  <q-page class="profile-page-ui q-pa-none">
    <div v-if="!currentUser" class="text-center q-mt-xl">
      <q-icon name="person" size="xl" color="grey" />
      <div class="text-h6 q-mt-md">Please log in to view your profile</div>
      <q-btn
        color="primary"
        label="Login"
        @click="showAuthDialog = true"
        class="q-mt-md"
        rounded
      />
    </div>

    <template v-else>
      <div class="row q-col-gutter-xl justify-center">
        <div class="col-12 col-md-4">
          <q-card class="profile-card-ui shadow-4 rounded-borders q-pa-lg q-mt-lg">
            <div class="text-center">
              <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md text-h4">
                {{ currentUser.username.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="text-h5 text-weight-bold">{{ currentUser.username }}</div>
              <div class="text-subtitle1 text-grey-7">{{ currentUser.email }}</div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-center">
              <q-btn
                color="negative"
                icon="logout"
                label="Logout"
                @click="logout"
                class="full-width text-weight-bold"
                rounded
              />
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-8">
          <q-card class="profile-content-card shadow-2 rounded-borders q-pa-lg">
            <q-tabs
              v-model="activeTab"
              dense
              class="profile-tabs text-grey-7 q-mb-md"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
              outside-arrows
              mobile-arrows
            >
              <q-tab name="reviews" icon="rate_review" label="Reviews" />
            </q-tabs>

            <q-separator spaced />

            <q-tab-panels v-model="activeTab" animated class="q-mt-md">
              <q-tab-panel name="reviews">
                <div v-if="currentUser.reviews.length === 0" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="rate_review" size="xl" color="grey" />
                  <div class="text-h6 q-mt-md">No reviews yet</div>
                </div>

                <div v-else class="q-gutter-y-md">
                  <q-card v-for="review in currentUser.reviews" :key="review.id" flat bordered class="profile-review-card shadow-1 rounded-borders q-pa-md">
                    <q-card-section class="q-pa-none">
                      <div class="row items-center q-mb-xs">
                        <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
                          {{ review.username ? review.username.charAt(0).toUpperCase() : '?' }}
                        </q-avatar>
                        <div class="text-subtitle2 text-weight-medium">{{ mediaTitles[`${review.mediaType}-${review.mediaId}`] || 'Loading...' }}</div>
                        <q-chip
                          v-if="!review.isPublic"
                          size="sm"
                          color="grey"
                          text-color="white"
                          class="q-ml-sm"
                        >
                          Private
                        </q-chip>
                        <div class="text-caption text-grey q-ml-auto">
                          {{ new Date(review.timestamp).toLocaleDateString() }}
                        </div>
                      </div>
                      <div class="row items-center q-mt-xs q-mb-xs">
                        <q-rating
                          :model-value="review.rating"
                          :max="10"
                          size="1.2em"
                          color="amber"
                          icon="star_border"
                          icon-selected="star"
                          readonly
                        />
                        <div class="text-caption q-ml-sm">{{ review.rating }}/10</div>
                      </div>
                      <p class="q-mt-sm q-mb-none text-body2">{{ review.content }}</p>
                    </q-card-section>
                  </q-card>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </template>

    <auth-dialog v-model="showAuthDialog" />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '../services/userService'
import { api } from '../services/api'
import AuthDialog from 'components/AuthDialog.vue'

export default defineComponent({
  name: 'ProfilePage',
  components: {
    AuthDialog
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('reviews')
    const showAuthDialog = ref(false)
    const currentUser = computed(() => {
      const user = userService.getCurrentUser()
      if (user) {
        return {
          ...user,
          reviews: userService.getAllUserReviews()
        }
      }
      return null
    })
    const mediaTitles = ref({})

    const getMediaType = (key) => {
      const [type] = key.split('-')
      return type === 'movie' ? 'Movie' : 'TV Show'
    }

    const loadMediaTitles = async () => {
      if (!currentUser.value) return

      // Load titles for ratings
      for (const key of Object.keys(currentUser.value.ratings)) {
        if (!mediaTitles.value[key]) {
          const [type, id] = key.split('-')
          try {
            if (type === 'movie') {
              const movie = await api.getMovieDetails(id)
              mediaTitles.value[key] = movie.title
            } else {
              const show = await api.getShowDetails(id)
              mediaTitles.value[key] = show.name
            }
          } catch (error) {
            console.error('Error fetching media title:', error)
            mediaTitles.value[key] = 'Unknown Title'
          }
        }
      }

      // Load titles for reviews
      for (const review of currentUser.value.reviews) {
        const key = `${review.mediaType}-${review.mediaId}`
        if (!mediaTitles.value[key]) {
          try {
            if (review.mediaType === 'movie') {
              const movie = await api.getMovieDetails(review.mediaId)
              mediaTitles.value[key] = movie.title
            } else {
              const show = await api.getShowDetails(review.mediaId)
              mediaTitles.value[key] = show.name
            }
          } catch (error) {
            console.error('Error fetching media title:', error)
            mediaTitles.value[key] = 'Unknown Title'
          }
        }
      }
    }

    const logout = async () => {
      try {
        await userService.logout()
        router.push('/')
      } catch (error) {
        console.error('Error logging out:', error)
      }
    }

    onMounted(() => {
      loadMediaTitles()
    })

    return {
      activeTab,
      showAuthDialog,
      currentUser,
      mediaTitles,
      getMediaType,
      logout
    }
  }
})
</script>

<style scoped>
.profile-page-ui {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
}

.q-dark .profile-page-ui {
  background: #181c1f;
}

.profile-card-ui {
  background: #fff;
  border-radius: 16px;
  margin-top: 40px;
  margin-bottom: 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  color: #222;
}

.q-dark .profile-card-ui {
  background: #23272b;
  color: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0,0,0,0.32);
}

.profile-content-card {
  background: #fff;
  border-radius: 16px;
  min-height: 600px;
  margin-top: 40px;
  margin-bottom: 40px;
  color: #222;
}

.q-dark .profile-content-card {
  background: #23272b;
  color: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0,0,0,0.32);
}

.profile-tabs {
  font-size: 1.1em;
  font-weight: 500;
}

.profile-rating-card, .profile-review-card {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
  color: #222;
}

.profile-rating-card:hover, .profile-review-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  transform: scale(1.01);
}

.q-dark .profile-rating-card, .q-dark .profile-review-card {
  background: #181c1f;
  color: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0,0,0,0.32);
}

.q-avatar {
  font-size: 1.1em;
  font-weight: bold;
}

@media (max-width: 900px) {
  .profile-card-ui, .profile-content-card {
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px !important;
  }
  .profile-tabs {
    font-size: 1em;
  }
}

@media (max-width: 600px) {
  .profile-page-ui {
    padding: 0;
  }
  .profile-card-ui, .profile-content-card {
    padding: 4px !important;
    margin-top: 4px;
    margin-bottom: 4px;
    border-radius: 8px;
  }
  .profile-tabs {
    font-size: 0.95em;
  }
  .profile-review-card {
    padding: 6px !important;
  }
}

@media (min-width: 900px) {
  .profile-card-ui {
    margin-left: 24px;
  }
}
</style> 
<template>
  <div class="review-section q-mt-xl">
    <div class="text-h6 q-mb-md">Reviews</div>

    <template v-if="userService.getCurrentUser()">
      <q-card class="review-form-card q-pa-md q-mb-lg shadow-2 rounded-borders">
        <q-form @submit.prevent="onSubmitReview">
          <div class="row items-center q-mb-md">
            <q-rating
              v-model="rating"
              :max="10"
              size="2em"
              color="amber"
              icon="star_border"
              icon-selected="star"
              required
            />
            <div class="text-h6 q-ml-sm">{{ rating }}/10</div>
          </div>

          <q-input
            v-model="newReview"
            type="textarea"
            label="Write a review"
            autogrow
            required
            class="q-mb-md"
            filled
            dense
          />
          <div class="row justify-between items-center">
            <q-toggle
              v-model="isPublic"
              label="Make review public"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Submit Review"
              :disable="!newReview.trim() || rating === 0"
              class="q-px-lg q-py-sm text-weight-bold"
              rounded
            />
          </div>
        </q-form>
      </q-card>
    </template>

    <q-separator spaced />

    <div v-if="reviews.length > 0" class="q-gutter-y-md">
      <q-card v-for="review in reviews" :key="review.id" flat bordered class="review-card shadow-1 rounded-borders q-pa-md">
        <q-card-section class="q-pa-none">
          <div class="row items-center q-mb-xs">
            <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
              {{ review.username ? review.username.charAt(0).toUpperCase() : '?' }}
            </q-avatar>
            <div class="text-subtitle2 text-weight-medium">{{ review.username }}</div>
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

    <div v-else class="text-center text-grey q-mt-md">
      No reviews yet
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { userService } from '../services/userService'

export default defineComponent({
  name: 'ReviewSection',
  props: {
    mediaId: {
      type: [String, Number],
      required: true
    },
    mediaType: {
      type: String,
      required: true
    }
  },
  emits: ['show-auth'],
  setup(props) {
    const reviews = ref([])
    const newReview = ref('')
    const isPublic = ref(true)
    const rating = ref(0)

    const loadReviews = () => {
      reviews.value = userService.getReviews(props.mediaId, props.mediaType)
    }

    const onSubmitReview = async () => {
      if (!newReview.value.trim() || rating.value === 0) {
        return
      }
      try {
        await userService.addReview(props.mediaId, props.mediaType, newReview.value, isPublic.value, rating.value)
        newReview.value = ''
        rating.value = 0
        isPublic.value = true
        loadReviews()
      } catch (err) {
        console.error('Error submitting review:', err)
      }
    }

    onMounted(() => {
      loadReviews()
    })

    return {
      reviews,
      newReview,
      isPublic,
      rating,
      onSubmitReview,
      userService
    }
  }
})
</script>

<style scoped>
.review-section {
  max-width: 700px;
  margin: 0 auto;
}

.review-form-card {
  background: #f8fafc;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.review-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.review-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  transform: scale(1.01);
}

.q-avatar {
  font-size: 1.1em;
  font-weight: bold;
}

@media (max-width: 600px) {
  .review-section {
    padding: 0 2px;
  }
  .review-form-card, .review-card {
    padding: 8px !important;
  }
}
</style> 
<template>
  <div class="rating-section">
    <div class="text-h6 q-mb-md">Your Rating</div>

    <template v-if="currentUser">
      <div class="row items-center">
        <q-rating
          v-model="userRating"
          :max="10"
          size="2em"
          color="amber"
          icon="star_border"
          icon-selected="star"
          @update:model-value="onRatingChange"
        />
        <div class="text-h6 q-ml-sm">{{ userRating }}/10</div>
      </div>
    </template>

    <div v-else class="text-center">
      <q-btn
        color="primary"
        label="Login to rate"
        @click="$emit('show-auth')"
      />
    </div>

    <div class="text-caption text-grey q-mt-sm">
      Average Rating: {{ averageRating }}/10 ({{ voteCount }} votes)
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { userService } from '../services/userService'

export default defineComponent({
  name: 'RatingSection',
  props: {
    mediaId: {
      type: [String, Number],
      required: true
    },
    mediaType: {
      type: String,
      required: true
    },
    averageRating: {
      type: Number,
      required: true
    },
    voteCount: {
      type: Number,
      required: true
    }
  },
  emits: ['show-auth'],
  setup(props, { emit }) {
    const userRating = ref(0)
    const currentUser = computed(() => {
      const user = userService.getCurrentUser()
      console.log('Current user in RatingSection:', user)
      return user
    })

    const loadUserRating = () => {
      console.log('Loading user rating for:', { mediaId: props.mediaId, mediaType: props.mediaType })
      userRating.value = userService.getRating(props.mediaId, props.mediaType) || 0
      console.log('Loaded user rating:', userRating.value)
    }

    const onRatingChange = (value) => {
      console.log('Rating changed to:', value)
      if (!currentUser.value) {
        console.log('No user logged in, emitting show-auth event')
        emit('show-auth')
        return
      }
      try {
        userService.addRating(props.mediaId, props.mediaType, value)
        console.log('Rating saved successfully')
      } catch (error) {
        console.error('Error submitting rating:', error)
      }
    }

    onMounted(() => {
      loadUserRating()
    })

    return {
      userRating,
      onRatingChange,
      currentUser
    }
  }
})
</script> 
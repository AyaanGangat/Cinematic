<template>
  <q-card class="my-card" flat bordered>
    <q-img
      :src="posterUrl"
      :ratio="2/3"
      class="cursor-pointer"
      @click="$emit('click')"
    >
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
          No Image Available
        </div>
      </template>
    </q-img>

    <q-card-section>
      <div class="text-h6 q-mt-sm q-mb-xs text-weight-bold ellipsis">
        {{ title }}
      </div>
      <div class="text-caption text-grey">
        <q-icon name="star" color="amber" size="xs" />
        {{ rating }}
        <span class="q-mx-sm">|</span>
        {{ releaseDate }}
      </div>
      <div class="text-caption text-grey q-mt-sm">
        <q-chip
          v-for="genre in genres"
          :key="genre"
          size="sm"
          color="primary"
          text-color="white"
          class="q-mr-xs"
        >
          {{ genre }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { api } from '../services/api'

export default defineComponent({
  name: 'MediaCard',
  props: {
    title: {
      type: String,
      required: true
    },
    posterPath: {
      type: String,
      required: true
    },
    rating: {
      type: [Number, String],
      required: true
    },
    releaseDate: {
      type: String,
      required: true
    },
    genres: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const posterUrl = computed(() => {
      return props.posterPath ? api.getPosterUrl(props.posterPath) : null
    })

    return {
      posterUrl
    }
  }
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 300px;
  transition: transform 0.2s;
  box-sizing: border-box;
}

.my-card:hover {
  transform: scale(1.02);
}

@media (max-width: 900px) {
  .my-card {
    max-width: 220px;
  }
  .text-h6 {
    font-size: 1.05rem;
  }
}

@media (max-width: 600px) {
  .my-card {
    max-width: 100vw;
    padding: 4px !important;
  }
  .text-h6 {
    font-size: 0.98rem;
  }
  .q-card-section {
    padding: 6px !important;
  }
}
</style> 
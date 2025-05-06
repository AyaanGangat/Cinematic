<template>
  <q-layout view="hHh lpR fFf" :class="{ 'bg-grey-1': !$q.dark.isActive, 'bg-dark': $q.dark.isActive }">
    <q-header elevated :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-primary text-white'">
      <q-toolbar class="main-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <div class="toolbar-title-nav">
          <q-toolbar-title class="full-title">
            <q-icon name="movie" size="md" class="q-mr-sm" />
            Ayaan's Mediaverse
          </q-toolbar-title>
          <q-tabs v-model="tab" shrink class="toolbar-tabs">
            <q-route-tab to="/" label="Home" />
            <q-route-tab to="/movies" label="Movies" />
            <q-route-tab to="/tv" label="TV Shows" />
            <q-route-tab v-if="currentUser" to="/profile" label="Profile" />
          </q-tabs>
        </div>

        <div class="toolbar-search">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search movies and TV shows"
            class="q-mr-md"
            style="width: 300px"
            @keyup.enter="performSearch"
          >
            <template v-slot:append>
              <q-icon name="search" class="cursor-pointer" @click="performSearch" />
            </template>
          </q-input>
        </div>

        <q-btn
          class="search-icon"
          icon="search"
          @click="showMobileSearch = true"
          flat
          round
          dense
        />

        <q-btn
          flat
          round
          dense
          :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
          :color="$q.dark.isActive ? 'yellow' : 'grey-8'"
          @click="toggleDarkMode"
          class="q-ml-md"
          aria-label="Toggle dark mode"
        />

        <q-btn
          v-if="!currentUser"
          flat
          icon="person"
          label="Login"
          @click="showAuthDialog = true"
        />
        <q-btn
          v-else
          flat
          icon="logout"
          label="Logout"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2'"
    >
      <q-list>
        <q-item-label
          header
          class="text-weight-bold"
        >
          Navigation
        </q-item-label>

        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            Home
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/movies">
          <q-item-section avatar>
            <q-icon name="movie" />
          </q-item-section>
          <q-item-section>
            Movies
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/tv">
          <q-item-section avatar>
            <q-icon name="live_tv" />
          </q-item-section>
          <q-item-section>
            TV Shows
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <auth-dialog v-model="showAuthDialog" />

    <q-dialog v-model="showMobileSearch">
      <q-card>
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Search movies and TV shows"
          class="q-mr-md"
          style="width: 300px"
          @keyup.enter="performSearch"
        >
          <template v-slot:append>
            <q-icon name="search" class="cursor-pointer" @click="performSearch" />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { userService } from '../services/userService'
import AuthDialog from 'components/AuthDialog.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    AuthDialog
  },
  setup () {
    const $q = useQuasar()
    const router = useRouter()
    const leftDrawerOpen = ref(false)
    const tab = ref('')
    const showAuthDialog = ref(false)
    const currentUser = computed(() => userService.getCurrentUser())
    const searchQuery = ref('')
    const showMobileSearch = ref(false)

    // Dark mode persistence
    if (localStorage.getItem('darkMode') === 'true') {
      $q.dark.set(true)
    }
    if (localStorage.getItem('darkMode') === 'false') {
      $q.dark.set(false)
    }

    watch(() => $q.dark.isActive, (val) => {
      localStorage.setItem('darkMode', val ? 'true' : 'false')
    })

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ path: '/search', query: { q: searchQuery.value } })
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

    const toggleDarkMode = () => {
      $q.dark.set(!$q.dark.isActive)
    }

    return {
      leftDrawerOpen,
      tab,
      showAuthDialog,
      currentUser,
      searchQuery,
      showMobileSearch,
      toggleLeftDrawer,
      performSearch,
      logout,
      toggleDarkMode,
      $q
    }
  }
})
</script>

<style scoped>
.q-toolbar {
  min-height: 50px;
}
.full-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  max-width: 100%;
  font-size: 1.2rem;
}
.toolbar-search {
  display: block;
}
.search-icon {
  display: none;
}
.toolbar-title-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1 1 auto;
}
.toolbar-tabs {
  margin-left: 16px;
}
@media (max-width: 600px) {
  .main-toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 4px 0;
  }
  .toolbar-title-nav {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  .full-title {
    font-size: 1rem;
    max-width: 100vw;
    margin-bottom: 2px;
  }
  .toolbar-tabs {
    margin-left: 0;
    width: 100%;
    font-size: 0.95em;
  }
  .toolbar-search {
    display: none;
  }
  .search-icon {
    display: inline-flex;
  }
}
</style>

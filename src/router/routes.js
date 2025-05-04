const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'movies', component: () => import('pages/MoviesPage.vue') },
      { path: 'tv', component: () => import('pages/TVShowsPage.vue') },
      { path: 'search', component: () => import('pages/SearchPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'movie/:id', component: () => import('pages/MovieDetailsPage.vue') },
      { path: 'tv/:id', component: () => import('pages/TVShowDetailsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

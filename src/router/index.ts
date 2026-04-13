import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import UserEdit from '../views/UserEdit.vue'
import Nutrition from '../views/Nutrition.vue'
import NutritionEdit from '../views/NutritionEdit.vue'
import Exercises from '../views/Exercises.vue'
import ExerciseEdit from '../views/ExerciseEdit.vue'
import DataManagement from '../views/DataManagement.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true }
    },
    {
      path: '/user/new',
      name: 'user-new',
      component: UserEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:id',
      name: 'user-edit',
      component: UserEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: Nutrition,
      meta: { requiresAuth: true }
    },
    {
      path: '/nutrition/new',
      name: 'nutrition-new',
      component: NutritionEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/nutrition/:id',
      name: 'nutrition-edit',
      component: NutritionEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: Exercises,
      meta: { requiresAuth: true }
    },
    {
      path: '/exercise/new',
      name: 'exercise-new',
      component: ExerciseEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/exercise/:id',
      name: 'exercise-edit',
      component: ExerciseEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/data',
      name: 'data',
      component: DataManagement,
      meta: { requiresAuth: true }
    }
  ]
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Si on va vers login et qu'on est déjà connecté, rediriger vers dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  // Si la route nécessite une authentification et qu'on n'est pas connecté
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Force le scroll et continue
  setTimeout(() => window.scrollTo(0, 0), 0)
  next()
})

export default router
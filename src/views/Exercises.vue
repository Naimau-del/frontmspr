<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary">Sessions d'Exercices</h2>
      <div>
        <button class="btn btn-outline-secondary me-2" @click="refreshData" :disabled="exercisesStore.loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spinner-border spinner-border-sm': exercisesStore.loading }"></i> 
          {{ exercisesStore.loading ? 'Chargement...' : 'Actualiser' }}
        </button>
        <button class="btn btn-primary" @click="router.push('/exercise/new')">
          <i class="bi bi-plus"></i> Nouvelle session
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Total Sessions</h5>
                <h3>{{ exercisesStore.exerciseStats.total }}</h3>
              </div>
              <i class="bi bi-activity fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">  
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Durée Moyenne</h5>
                <h3>{{ exercisesStore.exerciseStats.avgDuration }} min</h3>
              </div>
              <i class="bi bi-stopwatch fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Total Heures</h5>
                <h3>{{ exercisesStore.exerciseStats.totalDuration }}h</h3>
              </div>
              <i class="bi bi-clock fs-2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">Types d'Exercices</h5>
                <h3>{{ exercisesStore.exerciseStats.types }}</h3>
              </div>
              <i class="bi bi-list-ul fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Rechercher</label>
            <input 
              :value="exercisesStore.filters.search"
              @input="updateFilter('search', ($event.target as HTMLInputElement).value)"
              type="text" 
              class="form-control" 
              placeholder="Type d'exercice..."
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">Type</label>
            <select 
              :value="exercisesStore.filters.type"
              @change="updateFilter('type', ($event.target as HTMLSelectElement).value)"
              class="form-select"
            >
              <option value="">Tous</option>
              <option v-for="type in exercisesStore.sessionTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Période</label>
            <select 
              :value="exercisesStore.filters.dateRange"
              @change="updateFilter('dateRange', ($event.target as HTMLSelectElement).value)"
              class="form-select"
            >
              <option value="">Toutes</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <button class="btn btn-outline-secondary d-block" @click="resetFilters">Réinitialiser</button>
          </div>
        </div>
      </div>
    </div>


    <div class="card">
      <div class="card-body">
        <div v-if="exercisesStore.paginatedSessions.length === 0" class="text-center py-4">
          <i class="bi bi-activity fs-1 text-muted"></i>
          <p class="text-muted mt-2">Aucune session trouvée</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Durée</th>
                <th>BPM Max</th>
                <th>BPM Moyen</th>
                <th>BPM Repos</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in exercisesStore.paginatedSessions" :key="session.Session_ID">
                <td>
                  <strong>{{ formatDate(session.Session_Date) }}</strong>
                  <div class="text-muted small">{{ formatTime(session.Session_Date) }}</div>
                </td>
                <td>
                  <span class="badge bg-primary">{{ session.Session_Type || 'Non spécifié' }}</span>
                </td>
                <td>
                  <span v-if="session.Session_Duration" class="badge bg-info">
                    {{ session.Session_Duration }} min
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="session.Session_MaxBpm" class="text-danger fw-bold">
                    {{ session.Session_MaxBpm }} bpm
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="session.Session_AvgBpm" class="text-warning fw-bold">
                    {{ session.Session_AvgBpm }} bpm
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="session.Session_RestingBpm" class="text-success fw-bold">
                    {{ session.Session_RestingBpm }} bpm
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div v-if="session.User_Feedback_Score" class="d-flex align-items-center">
                    <span class="me-1">{{ session.User_Feedback_Score }}/10</span>
                    <div class="rating">
                      <i v-for="i in 5" :key="i" 
                         class="bi" 
                         :class="i <= Math.round((session.User_Feedback_Score || 0) / 2) ? 'bi-star-fill text-warning' : 'bi-star text-muted'">
                      </i>
                    </div>
                  </div>
                  <span v-else class="text-muted">Non noté</span>
                </td>
                <td>
                  <div class="dropdown">
                    <button class="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                      Actions
                    </button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="#" @click="router.push(`/exercise/${session.Session_ID}`)">
                        <i class="bi bi-pencil"></i> Modifier
                      </a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item text-danger" href="#" @click="deleteSessionPrompt(session.Session_ID)">
                        <i class="bi bi-trash"></i> Supprimer
                      </a></li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav class="mt-4" v-if="exercisesStore.totalSessions > 0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted">
                Affichage de {{ (exercisesStore.currentPage - 1) * exercisesStore.itemsPerPage + 1 }} à 
                {{ Math.min(exercisesStore.currentPage * exercisesStore.itemsPerPage, exercisesStore.totalSessions) }} 
                sur {{ exercisesStore.totalSessions }} sessions
              </span>
            </div>
            <div class="d-flex align-items-center">
              <label class="me-2">Éléments par page :</label>
              <select 
                :value="exercisesStore.itemsPerPage" 
                @change="exercisesStore.setItemsPerPage(parseInt(($event.target as HTMLSelectElement).value))"
                class="form-select me-3" 
                style="width: auto;"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: exercisesStore.currentPage === 1 }">
                  <a class="page-link" @click="exercisesStore.setPage(exercisesStore.currentPage - 1)">&laquo;</a>
                </li>
                <li v-for="page in visiblePages" :key="page" 
                    class="page-item" :class="{ active: page === exercisesStore.currentPage }">
                  <a class="page-link" @click="exercisesStore.setPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: exercisesStore.currentPage === exercisesStore.totalPages }">
                  <a class="page-link" @click="exercisesStore.setPage(exercisesStore.currentPage + 1)">&raquo;</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>


    <div v-if="selectedSession" class="card mt-4 border-primary">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Détails de la session</h5>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="selectedSession = null">Fermer</button>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-muted">Informations générales</h6>
            <p><strong>Date :</strong> {{ formatDate(selectedSession.Session_Date) }}</p>
            <p><strong>Heure :</strong> {{ formatTime(selectedSession.Session_Date) }}</p>
            <p><strong>Type :</strong> {{ selectedSession.Session_Type || 'Non spécifié' }}</p>
            <p><strong>Durée :</strong> {{ selectedSession.Session_Duration ? selectedSession.Session_Duration + ' minutes' : 'Non spécifiée' }}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted">Données cardiaques</h6>
            <p><strong>BPM Maximum :</strong> {{ selectedSession.Session_MaxBpm || 'Non mesuré' }}</p>
            <p><strong>BPM Moyen :</strong> {{ selectedSession.Session_AvgBpm || 'Non mesuré' }}</p>
            <p><strong>BPM au Repos :</strong> {{ selectedSession.Session_RestingBpm || 'Non mesuré' }}</p>
            <p><strong>Note utilisateur :</strong>
              <span v-if="selectedSession.User_Feedback_Score">{{ selectedSession.User_Feedback_Score }}/10 ⭐</span>
              <span v-else>Non noté</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useExerciseStore } from '../stores/exercises'
import { useRouter } from 'vue-router'
import type { WorkoutSession } from '../services/api'

// Stores
const exercisesStore = useExerciseStore()
const router = useRouter()

// État local
const selectedSession = ref<WorkoutSession | null>(null)

// Computed
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, exercisesStore.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(exercisesStore.totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Méthodes
const updateFilter = (key: string, value: string) => {
  exercisesStore.setFilters({ [key]: value })
}

const resetFilters = () => {
  exercisesStore.setFilters({
    search: '',
    type: '',
    dateRange: ''
  })
}

const refreshData = async () => {
  await exercisesStore.fetchWorkoutSessions()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const viewSessionDetails = (session: WorkoutSession) => {
  selectedSession.value = selectedSession.value?.Session_ID === session.Session_ID ? null : session
}

const deleteSessionPrompt = async (sessionId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
    try {
      await exercisesStore.deleteWorkoutSession(sessionId)
      alert('Session supprimée avec succès')
    } catch (error) {
      alert('Erreur lors de la suppression de la session')
    }
  }
}

// Lifecycle
onMounted(async () => {
  await exercisesStore.fetchWorkoutSessions()
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
  border-top: none;
}

.badge {
  font-size: 0.75rem;
}

.rating {
  font-size: 0.8rem;
}

.rating .bi {
  margin-right: 1px;
}
</style>

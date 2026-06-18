<template>
  <div class="container mt-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-outline-secondary me-3" @click="goBack">
        <i class="bi bi-arrow-left"></i> Retour
      </button>
      <h2 class="text-primary mb-0">{{ isEditing ? 'Modifier' : 'Ajouter' }} une session</h2>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="saveSession">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Date de la session *</label>
                    <input v-model="form.Session_Date" type="date" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Durée (minutes)</label>
                    <input v-model.number="form.Session_Duration" type="number" class="form-control" min="1" step="1" 
                           placeholder="Ex: 45">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Type d'exercice</label>
                    <input v-model="form.Session_Type" type="text" class="form-control" 
                           placeholder="Ex: Course, Vélo, Musculation...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Note de satisfaction (1-10)</label>
                    <input v-model.number="form.User_Feedback_Score" type="number" class="form-control" min="1" max="10">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Fréquence cardiaque moyenne (bpm)</label>
                    <input v-model.number="form.Session_AvgBpm" type="number" class="form-control" min="40" max="220" 
                           placeholder="Ex: 140">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Fréquence cardiaque maximale (bpm)</label>
                    <input v-model.number="form.Session_MaxBpm" type="number" class="form-control" min="60" max="220">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Fréquence cardiaque de repos (bpm)</label>
                    <input v-model.number="form.Session_RestingBpm" type="number" class="form-control" min="30" max="200">
                  </div>
                </div>
              </div>
              
              <!-- Résumé de la session -->
              <div class="row mt-3" v-if="hasSessionData">
                <div class="col-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Résumé de la session</h6>
                      <div class="row text-center">
                        <div class="col-md-4" v-if="form.Session_Duration">
                          <div class="text-primary"><strong>{{ form.Session_Duration }}</strong></div>
                          <small class="text-muted">minutes</small>
                        </div>
                        <div class="col-md-4" v-if="form.Session_AvgBpm">
                          <div class="text-warning"><strong>{{ form.Session_AvgBpm }}</strong></div>
                          <small class="text-muted">bpm (moy)</small>
                        </div>
                        <div class="col-md-4" v-if="form.User_Feedback_Score">
                          <div class="text-success"><strong>{{ form.User_Feedback_Score }}/10</strong></div>
                          <small class="text-muted">Note</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end mt-3">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="exercisesStore.loading">
                  <span v-if="exercisesStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExerciseStore } from '../stores/exercises'

const router = useRouter()
const route = useRoute()
const exercisesStore = useExerciseStore()

const isEditing = computed(() => !!route.params.id)
const sessionId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)

const form = ref({
  Session_Date: '',
  Session_Duration: null as number | null,
  Session_Type: '',
  User_Feedback_Score: null as number | null,
  Session_AvgBpm: null as number | null,
  Session_MaxBpm: null as number | null,
  Session_RestingBpm: null as number | null,
})

const hasSessionData = computed(() => {
  return form.value.Session_Duration || form.value.Session_AvgBpm || form.value.User_Feedback_Score
})

const loadSession = async () => {
  if (sessionId.value && exercisesStore.workoutSessions.length === 0) {
    await exercisesStore.fetchWorkoutSessions()
  }
  
  if (sessionId.value) {
    const session = exercisesStore.workoutSessions.find((s: any) => s.Session_ID === sessionId.value)
    if (session) {
      // Formater la date pour l'input date HTML
      const sessionDate = session.Session_Date ? new Date(session.Session_Date) : new Date()
      const formattedDate = sessionDate.toISOString().split('T')[0] || ''
      
      form.value = {
        Session_Date: formattedDate,
        Session_Duration: session.Session_Duration,
        Session_Type: session.Session_Type || '',
        User_Feedback_Score: session.User_Feedback_Score,
        Session_AvgBpm: session.Session_AvgBpm,
        Session_MaxBpm: session.Session_MaxBpm,
        Session_RestingBpm: session.Session_RestingBpm,
      }
    }
  } else {
    // Valeur par défaut pour une nouvelle session : date d'aujourd'hui
    form.value.Session_Date = new Date().toISOString().split('T')[0] || ''
  }
}

const saveSession = async () => {
  try {
    if (isEditing.value && sessionId.value) {
      // Modification
      await exercisesStore.updateWorkoutSession(sessionId.value, form.value as any)
      alert('Session modifiée avec succès!')
    } else {
      // Création
      await exercisesStore.createWorkoutSession(form.value as any)
      alert('Session créée avec succès!')
    }
    
    router.push('/exercises')
  } catch (error: any) {
    alert(`Erreur: ${error.response?.data?.detail || 'Une erreur est survenue'}`)
  }
}

const goBack = () => {
  router.push('/exercises')
}

onMounted(() => {
  loadSession()
})
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>
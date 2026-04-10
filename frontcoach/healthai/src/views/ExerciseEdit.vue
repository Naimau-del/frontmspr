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
                    <input v-model="form.session_date" type="date" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Durée (minutes)</label>
                    <input v-model.number="form.session_duration" type="number" class="form-control" min="1" step="1" 
                           placeholder="Ex: 45">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Calories brûlées</label>
                    <input v-model.number="form.calories_burn" type="number" class="form-control" min="0" step="1" 
                           placeholder="Ex: 300">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Intensité</label>
                    <select v-model="form.intensity" class="form-select">
                      <option value="">Sélectionner l'intensité</option>
                      <option value="Faible">Faible</option>
                      <option value="Modérée">Modérée</option>
                      <option value="Élevée">Élevée</option>
                      <option value="Très élevée">Très élevée</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Fréquence cardiaque moyenne (bpm)</label>
                    <input v-model.number="form.heart_rate" type="number" class="form-control" min="40" max="220" 
                           placeholder="Ex: 140">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Distance (km)</label>
                    <input v-model.number="form.distance" type="number" step="0.1" class="form-control" min="0" 
                           placeholder="Ex: 5.2">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Type d'exercice</label>
                    <input v-model="form.exercise_type" type="text" class="form-control" 
                           placeholder="Ex: Course, Vélo, Musculation...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Zone de fréquence cardiaque</label>
                    <select v-model="form.heart_rate_zone" class="form-select">
                      <option value="">Non spécifiée</option>
                      <option value="Zone 1 - Récupération">Zone 1 - Récupération (50-60%)</option>
                      <option value="Zone 2 - Aérobie de base">Zone 2 - Aérobie de base (60-70%)</option>
                      <option value="Zone 3 - Aérobie">Zone 3 - Aérobie (70-80%)</option>
                      <option value="Zone 4 - Anaérobie">Zone 4 - Anaérobie (80-90%)</option>
                      <option value="Zone 5 - VO2 Max">Zone 5 - VO2 Max (90-100%)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Notes sur la session</label>
                <textarea v-model="form.session_notes" class="form-control" rows="3" 
                          placeholder="Notes sur l'entraînement, ressenti, conditions..."></textarea>
              </div>
              
              <!-- Résumé de la session -->
              <div class="row mt-3" v-if="hasSessionData">
                <div class="col-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Résumé de la session</h6>
                      <div class="row text-center">
                        <div class="col-md-3" v-if="form.session_duration">
                          <div class="text-primary"><strong>{{ form.session_duration }}</strong></div>
                          <small class="text-muted">minutes</small>
                        </div>
                        <div class="col-md-3" v-if="form.calories_burn">
                          <div class="text-danger"><strong>{{ form.calories_burn }}</strong></div>
                          <small class="text-muted">kcal</small>
                        </div>
                        <div class="col-md-3" v-if="form.distance">
                          <div class="text-success"><strong>{{ form.distance }}</strong></div>
                          <small class="text-muted">km</small>
                        </div>
                        <div class="col-md-3" v-if="form.heart_rate">
                          <div class="text-warning"><strong>{{ form.heart_rate }}</strong></div>
                          <small class="text-muted">bpm</small>
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

const hasSessionData = computed(() => {
  return form.value.session_duration || form.value.calories_burn || form.value.distance || form.value.heart_rate
})

const form = ref({
  session_date: '',
  session_duration: null as number | null,
  calories_burn: null as number | null,
  intensity: '',
  heart_rate: null as number | null,
  distance: null as number | null,
  exercise_type: '',
  heart_rate_zone: '',
  session_notes: ''
})

const loadSession = async () => {
  if (sessionId.value && exercisesStore.sessions.length === 0) {
    await exercisesStore.fetchSessions()
  }
  
  if (sessionId.value) {
    const session = exercisesStore.sessions.find((s: any) => s.Session_ID === sessionId.value)
    if (session) {
      // Formater la date pour l'input date HTML
      const sessionDate = session.session_date ? new Date(session.session_date) : new Date()
      const formattedDate = sessionDate.toISOString().split('T')[0]
      
      form.value = {
        session_date: formattedDate,
        session_duration: session.session_duration,
        calories_burn: session.calories_burn,
        intensity: session.intensity || '',
        heart_rate: session.heart_rate,
        distance: session.distance,
        exercise_type: session.exercise_type || '',
        heart_rate_zone: session.heart_rate_zone || '',
        session_notes: session.session_notes || ''
      }
    }
  } else {
    // Valeur par défaut pour une nouvelle session : date d'aujourd'hui
    form.value.session_date = new Date().toISOString().split('T')[0]
  }
}

const saveSession = async () => {
  try {
    if (isEditing.value && sessionId.value) {
      // Modification
      await exercisesStore.updateSession(sessionId.value, form.value)
      alert('Session modifiée avec succès!')
    } else {
      // Création
      await exercisesStore.createSession(form.value)
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
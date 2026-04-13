<template>
  <div class="modal fade" id="exerciseEditModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Modifier' : 'Ajouter' }} une session d'entraînement</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="saveSession">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Date de la session *</label>
                  <input v-model="form.Session_Date" type="date" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Type d'entraînement</label>
                  <select v-model="form.Session_Type" class="form-select">
                    <option value="">Sélectionner...</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Musculation">Musculation</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Running">Running</option>
                    <option value="Cyclisme">Cyclisme</option>
                    <option value="Natation">Natation</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Durée (minutes)</label>
                  <input v-model.number="form.Session_Duration" type="number" class="form-control" min="1" max="600">
                </div>
                <div class="mb-3">
                  <label class="form-label">Note de satisfaction (1-10)</label>
                  <input v-model.number="form.User_Feedback_Score" type="number" class="form-control" min="1" max="10">
                  <div class="form-text">1 = Très insatisfait, 10 = Excellent</div>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted mb-3">Données cardiaques</h6>
                <div class="mb-3">
                  <label class="form-label">Fréquence cardiaque au repos (bpm)</label>
                  <input v-model.number="form.Session_RestingBpm" type="number" class="form-control" min="30" max="200">
                </div>
                <div class="mb-3">
                  <label class="form-label">Fréquence cardiaque moyenne (bpm)</label>
                  <input v-model.number="form.Session_AvgBpm" type="number" class="form-control" min="50" max="220">
                </div>
                <div class="mb-3">
                  <label class="form-label">Fréquence cardiaque maximale (bpm)</label>
                  <input v-model.number="form.Session_MaxBpm" type="number" class="form-control" min="60" max="220">
                </div>
                
                <!-- Indicateurs visuels -->
                <div class="mt-3" v-if="hasCardiacData">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Intensité estimée</h6>
                      <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                          <div class="progress">
                            <div class="progress-bar" :class="intensityColor" 
                                 :style="`width: ${intensityPercentage}%`"></div>
                          </div>
                        </div>
                        <span class="ms-2 text-muted">{{ intensityLevel }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorkoutSession } from '../services/api'

interface Props {
  session?: WorkoutSession | null
  loading?: boolean
}

interface Emits {
  (e: 'save', session: any): void
}

const props = withDefaults(defineProps<Props>(), {
  session: null,
  loading: false
})

const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.session)

const hasCardiacData = computed(() => {
  return form.value.Session_AvgBpm || form.value.Session_MaxBpm
})

const intensityPercentage = computed(() => {
  if (!form.value.Session_AvgBpm) return 0
  // Estimation basée sur une FC max théorique de 220 - âge (on utilise 190 comme référence)
  return Math.min((form.value.Session_AvgBpm / 190) * 100, 100)
})

const intensityLevel = computed(() => {
  const percentage = intensityPercentage.value
  if (percentage < 50) return 'Légère'
  if (percentage < 70) return 'Modérée'  
  if (percentage < 85) return 'Vigoureuse'
  return 'Très intense'
})

const intensityColor = computed(() => {
  const percentage = intensityPercentage.value
  if (percentage < 50) return 'bg-success'
  if (percentage < 70) return 'bg-info'  
  if (percentage < 85) return 'bg-warning'
  return 'bg-danger'
})

const form = ref({
  Session_Date: '',
  Session_MaxBpm: null as number | null,
  Session_AvgBpm: null as number | null,
  Session_RestingBpm: null as number | null,
  Session_Duration: null as number | null,
  Session_Type: '',
  User_Feedback_Score: null as number | null
})

const resetForm = () => {
  if (props.session) {
    form.value = {
      Session_Date: props.session.Session_Date || '',
      Session_MaxBpm: props.session.Session_MaxBpm,
      Session_AvgBpm: props.session.Session_AvgBpm,
      Session_RestingBpm: props.session.Session_RestingBpm,
      Session_Duration: props.session.Session_Duration,
      Session_Type: props.session.Session_Type || '',
      User_Feedback_Score: props.session.User_Feedback_Score
    }
  } else {
    // Mettre la date d'aujourd'hui par défaut
    const today = new Date().toISOString().split('T')[0]
    form.value = {
      Session_Date: today,
      Session_MaxBpm: null,
      Session_AvgBpm: null,
      Session_RestingBpm: null,
      Session_Duration: null,
      Session_Type: '',
      User_Feedback_Score: null
    }
  }
}

const saveSession = () => {
  emit('save', { ...form.value })
}

// Watch for session prop changes
import { watch } from 'vue'
watch(() => props.session, resetForm, { immediate: true })
</script>
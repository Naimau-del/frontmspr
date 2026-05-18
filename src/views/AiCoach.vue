<template>
  <div class="container mt-4">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="mb-1">
          <i class="bi bi-robot text-success"></i> Coach IA Personnalisé
        </h1>
        <p class="text-muted">Obtenez un plan sur-mesure généré par intelligence artificielle</p>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'nutrition' }"
          @click="activeTab = 'nutrition'"
        >
          <i class="bi bi-egg-fried me-1"></i> Nutrition
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'workout' }"
          @click="activeTab = 'workout'"
        >
          <i class="bi bi-lightning-charge me-1"></i> Exercices physiques
        </button>
      </li>
    </ul>

    <!-- ───────────────── ONGLET NUTRITION ───────────────── -->
    <div v-if="activeTab === 'nutrition'">
      <div class="row">
        <!-- Formulaire -->
        <div class="col-lg-4 mb-4">
          <div class="card border-success shadow-sm">
            <div class="card-header bg-success text-white">
              <i class="bi bi-sliders me-1"></i> Paramètres nutritionnels
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Objectif</label>
                <select v-model="nutritionForm.goal" class="form-select">
                  <option value="weight_loss">Perte de poids</option>
                  <option value="muscle_gain">Prise de masse</option>
                  <option value="maintenance">Maintien</option>
                  <option value="endurance">Endurance</option>
                  <option value="general_health">Santé générale</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Niveau d'activité</label>
                <select v-model="nutritionForm.activity_level" class="form-select">
                  <option value="sedentary">Sédentaire</option>
                  <option value="lightly_active">Légèrement actif</option>
                  <option value="moderately_active">Modérément actif</option>
                  <option value="very_active">Très actif</option>
                </select>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Âge</label>
                  <input v-model.number="nutritionForm.age" type="number" class="form-control" placeholder="30" min="10" max="100" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Genre</label>
                  <select v-model="nutritionForm.gender" class="form-select">
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Poids (kg)</label>
                  <input v-model.number="nutritionForm.weight_kg" type="number" class="form-control" placeholder="70" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Taille (cm)</label>
                  <input v-model.number="nutritionForm.height_cm" type="number" class="form-control" placeholder="175" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Repas par jour</label>
                <select v-model.number="nutritionForm.nb_meals_per_day" class="form-select">
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                  <option :value="4">4</option>
                  <option :value="5">5</option>
                  <option :value="6">6</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Budget</label>
                <select v-model="nutritionForm.budget_level" class="form-select">
                  <option value="low">Économique</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Allergies</label>
                <input v-model="nutritionForm.allergies" type="text" class="form-control" placeholder="ex: gluten, lactose" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Préférences alimentaires</label>
                <input v-model="nutritionForm.dietary_preferences" type="text" class="form-control" placeholder="ex: végétarien, sans porc" />
              </div>
              <button
                class="btn btn-success w-100"
                :disabled="nutritionLoading"
                @click="fetchNutritionRecommendation"
              >
                <span v-if="nutritionLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-magic me-1"></i>
                Générer mon plan nutrition
              </button>
            </div>
          </div>
        </div>

        <!-- Résultats nutrition -->
        <div class="col-lg-8">
          <div v-if="nutritionError" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-1"></i> {{ nutritionError }}
          </div>

          <div v-if="!nutritionResult && !nutritionLoading" class="text-center text-muted py-5">
            <i class="bi bi-egg-fried display-1 text-success opacity-25"></i>
            <p class="mt-3 fs-5">Renseignez vos paramètres et cliquez sur <strong>Générer</strong></p>
          </div>

          <div v-if="nutritionLoading" class="text-center py-5">
            <div class="spinner-border text-success" style="width:3rem;height:3rem;"></div>
            <p class="mt-3 text-muted">L'IA génère votre plan…</p>
          </div>

          <div v-if="nutritionResult">
            <!-- Macros -->
            <div class="card mb-3 shadow-sm">
              <div class="card-header bg-success text-white fw-bold">
                <i class="bi bi-bar-chart-line me-1"></i> Objectifs nutritionnels journaliers
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6 col-md-3 mb-3">
                    <div class="bg-warning bg-opacity-10 rounded p-3">
                      <div class="fs-3 fw-bold text-warning">{{ Math.round(nutritionResult.macro_targets.calories) }}</div>
                      <div class="small text-muted">kcal / jour</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3 mb-3">
                    <div class="bg-danger bg-opacity-10 rounded p-3">
                      <div class="fs-3 fw-bold text-danger">{{ Math.round(nutritionResult.macro_targets.protein_g) }}g</div>
                      <div class="small text-muted">Protéines</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3 mb-3">
                    <div class="bg-primary bg-opacity-10 rounded p-3">
                      <div class="fs-3 fw-bold text-primary">{{ Math.round(nutritionResult.macro_targets.carbs_g) }}g</div>
                      <div class="small text-muted">Glucides</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3 mb-3">
                    <div class="bg-info bg-opacity-10 rounded p-3">
                      <div class="fs-3 fw-bold text-info">{{ Math.round(nutritionResult.macro_targets.fat_g) }}g</div>
                      <div class="small text-muted">Lipides</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alertes -->
            <div v-for="warn in nutritionResult.deficit_warnings" :key="warn" class="alert alert-warning py-2">
              <i class="bi bi-exclamation-circle me-1"></i> {{ warn }}
            </div>
            <div v-for="warn in nutritionResult.excess_warnings" :key="warn" class="alert alert-danger py-2">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ warn }}
            </div>

            <!-- Conseil LLM -->
            <div v-if="nutritionResult.llm_advice" class="alert alert-success mb-3">
              <i class="bi bi-chat-square-quote me-1"></i> <strong>Conseil IA :</strong> {{ nutritionResult.llm_advice }}
            </div>

            <!-- Plan repas -->
            <div class="card shadow-sm">
              <div class="card-header fw-bold">
                <i class="bi bi-calendar3 me-1"></i> Plan de repas
              </div>
              <div class="list-group list-group-flush">
                <div
                  v-for="(item, i) in nutritionResult.meal_plan"
                  :key="i"
                  class="list-group-item"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="badge bg-success me-2 text-capitalize">{{ item.meal_slot }}</span>
                      <strong>{{ item.product_name }}</strong>
                      <div class="small text-muted">{{ item.portion_g }}g</div>
                    </div>
                    <div class="text-end small">
                      <div class="text-warning fw-bold">{{ Math.round(item.kcal) }} kcal</div>
                      <div class="text-muted">P: {{ Math.round(item.protein_g) }}g · G: {{ Math.round(item.carbs_g) }}g · L: {{ Math.round(item.fat_g) }}g</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ───────────────── ONGLET EXERCICES ───────────────── -->
    <div v-if="activeTab === 'workout'">
      <div class="row">
        <!-- Formulaire -->
        <div class="col-lg-4 mb-4">
          <div class="card border-primary shadow-sm">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-sliders me-1"></i> Paramètres d'entraînement
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Objectif</label>
                <select v-model="workoutForm.goal" class="form-select">
                  <option value="weight_loss">Perte de poids</option>
                  <option value="muscle_gain">Prise de masse</option>
                  <option value="maintenance">Maintien</option>
                  <option value="endurance">Endurance</option>
                  <option value="general_health">Santé générale</option>
                </select>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Âge</label>
                  <input v-model.number="workoutForm.age" type="number" class="form-control" placeholder="30" min="10" max="100" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Genre</label>
                  <select v-model="workoutForm.gender" class="form-select">
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Poids (kg)</label>
                  <input v-model.number="workoutForm.weight_kg" type="number" class="form-control" placeholder="70" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Taille (cm)</label>
                  <input v-model.number="workoutForm.height_cm" type="number" class="form-control" placeholder="175" />
                </div>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Séances / semaine</label>
                  <select v-model.number="workoutForm.sessions_per_week" class="form-select">
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                    <option :value="3">3</option>
                    <option :value="4">4</option>
                    <option :value="5">5</option>
                    <option :value="6">6</option>
                    <option :value="7">7</option>
                  </select>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Durée (min)</label>
                  <input v-model.number="workoutForm.preferred_duration_min" type="number" class="form-control" placeholder="45" min="10" max="180" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Équipements disponibles</label>
                <div class="row row-cols-2 g-1">
                  <div v-for="eq in equipmentOptions" :key="eq.value" class="col">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="'eq-' + eq.value"
                        :value="eq.value"
                        v-model="workoutForm.available_equipment"
                      />
                      <label class="form-check-label small" :for="'eq-' + eq.value">{{ eq.label }}</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Blessures / contre-indications</label>
                <input v-model="workoutForm.injuries" type="text" class="form-control" placeholder="ex: genou droit, dos" />
              </div>
              <button
                class="btn btn-primary w-100"
                :disabled="workoutLoading"
                @click="fetchWorkoutRecommendation"
              >
                <span v-if="workoutLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-magic me-1"></i>
                Générer mon programme
              </button>
            </div>
          </div>
        </div>

        <!-- Résultats workout -->
        <div class="col-lg-8">
          <div v-if="workoutError" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-1"></i> {{ workoutError }}
          </div>

          <div v-if="!workoutResult && !workoutLoading" class="text-center text-muted py-5">
            <i class="bi bi-lightning-charge display-1 text-primary opacity-25"></i>
            <p class="mt-3 fs-5">Renseignez vos paramètres et cliquez sur <strong>Générer</strong></p>
          </div>

          <div v-if="workoutLoading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>
            <p class="mt-3 text-muted">L'IA génère votre programme…</p>
          </div>

          <div v-if="workoutResult">
            <!-- Niveau détecté -->
            <div class="card mb-3 shadow-sm">
              <div class="card-body d-flex align-items-center gap-3">
                <div class="text-center">
                  <span class="badge fs-6 px-3 py-2" :class="fitnessLevelClass">
                    <i class="bi bi-award me-1"></i>
                    {{ fitnessLevelLabel }}
                  </span>
                  <div class="small text-muted mt-1">Niveau détecté</div>
                </div>
                <div class="flex-grow-1 text-muted small">
                  Programme sur <strong>{{ workoutResult.weekly_plan.length }} jour(s)</strong>
                  · {{ workoutResult.model_version }}
                </div>
              </div>
            </div>

            <!-- Notes adaptatives -->
            <div v-if="workoutResult.adaptive_notes.length" class="alert alert-info mb-3">
              <strong><i class="bi bi-info-circle me-1"></i> Notes :</strong>
              <ul class="mb-0 mt-1">
                <li v-for="note in workoutResult.adaptive_notes" :key="note">{{ note }}</li>
              </ul>
            </div>
            <div v-if="workoutResult.contraindications.length" class="alert alert-warning mb-3">
              <strong><i class="bi bi-shield-exclamation me-1"></i> Contre-indications :</strong>
              <ul class="mb-0 mt-1">
                <li v-for="c in workoutResult.contraindications" :key="c">{{ c }}</li>
              </ul>
            </div>

            <!-- Conseil LLM -->
            <div v-if="workoutResult.llm_advice" class="alert alert-primary mb-3">
              <i class="bi bi-chat-square-quote me-1"></i> <strong>Conseil IA :</strong> {{ workoutResult.llm_advice }}
            </div>

            <!-- Plan hebdomadaire -->
            <div
              v-for="session in workoutResult.weekly_plan"
              :key="session.day"
              class="card mb-3 shadow-sm"
            >
              <div class="card-header d-flex justify-content-between align-items-center" :class="workoutTypeClass(session.workout_type)">
                <span class="fw-bold">
                  <i class="bi bi-calendar-day me-1"></i> Jour {{ session.day }} –
                  <span class="text-capitalize">{{ workoutTypeLabel(session.workout_type) }}</span>
                </span>
                <div class="d-flex gap-2 align-items-center">
                  <span class="badge bg-white bg-opacity-25">{{ session.duration_min }} min</span>
                  <span class="badge" :class="intensityBadge(session.intensity)">{{ intensityLabel(session.intensity) }}</span>
                </div>
              </div>
              <div class="card-body">
                <!-- Échauffement -->
                <div v-if="session.warm_up.length" class="mb-2">
                  <div class="text-muted small fw-bold mb-1"><i class="bi bi-thermometer-sun me-1"></i>Échauffement</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="w in session.warm_up" :key="w" class="badge bg-warning text-dark">{{ w }}</span>
                  </div>
                </div>

                <!-- Exercices -->
                <table class="table table-sm table-hover mb-2">
                  <thead class="table-light">
                    <tr>
                      <th>Exercice</th>
                      <th class="text-center">Séries</th>
                      <th class="text-center">Répétitions</th>
                      <th class="text-center">Repos</th>
                      <th class="text-center">kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ex in session.exercises" :key="ex.name">
                      <td>
                        <strong>{{ ex.name }}</strong>
                        <div v-if="ex.notes" class="small text-muted">{{ ex.notes }}</div>
                      </td>
                      <td class="text-center">{{ ex.sets ?? '–' }}</td>
                      <td class="text-center">{{ ex.reps ?? '–' }}</td>
                      <td class="text-center">{{ ex.rest_seconds ? ex.rest_seconds + 's' : '–' }}</td>
                      <td class="text-center">{{ ex.kcal_burned_estimate ? Math.round(ex.kcal_burned_estimate) : '–' }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Retour au calme -->
                <div v-if="session.cool_down.length">
                  <div class="text-muted small fw-bold mb-1"><i class="bi bi-snow me-1"></i>Retour au calme</div>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="c in session.cool_down" :key="c" class="badge bg-info text-dark">{{ c }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { config } from '../config'

const authStore = useAuthStore()
const activeTab = ref<'nutrition' | 'workout'>('nutrition')

const AI_BASE_URL = config.AI_BASE_URL

// ── Nutrition ──────────────────────────────────────────────────────────────
const nutritionLoading = ref(false)
const nutritionError = ref<string | null>(null)
const nutritionResult = ref<any | null>(null)

const nutritionForm = ref({
  goal: 'general_health',
  activity_level: 'moderately_active',
  age: null as number | null,
  gender: 'male' as string,
  weight_kg: null as number | null,
  height_cm: null as number | null,
  nb_meals_per_day: 3,
  budget_level: 'medium',
  allergies: '',
  dietary_preferences: '',
})

// ── Workout ────────────────────────────────────────────────────────────────
const workoutLoading = ref(false)
const workoutError = ref<string | null>(null)
const workoutResult = ref<any | null>(null)

const workoutForm = ref({
  goal: 'general_health',
  age: null as number | null,
  gender: 'male' as string,
  weight_kg: null as number | null,
  height_cm: null as number | null,
  sessions_per_week: 3,
  preferred_duration_min: 45,
  available_equipment: [] as string[],
  injuries: '',
})

const equipmentOptions = [
  { value: 'barbell', label: 'Barre' },
  { value: 'dumbbell', label: 'Haltères' },
  { value: 'treadmill', label: 'Tapis de course' },
  { value: 'bike', label: 'Vélo' },
  { value: 'pull_up_bar', label: 'Barre de traction' },
  { value: 'resistance_bands', label: 'Élastiques' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'none', label: 'Aucun (poids du corps)' },
]

// ── Pré-remplissage depuis le profil ──────────────────────────────────────
onMounted(() => {
  const u = authStore.user
  if (!u) return

  const age = u.User_age ?? null
  const gender = u.User_gender === 'M' || u.User_gender?.toLowerCase() === 'male' ? 'male'
    : u.User_gender === 'F' || u.User_gender?.toLowerCase() === 'female' ? 'female' : 'other'

  nutritionForm.value.age = age
  nutritionForm.value.gender = gender
  nutritionForm.value.weight_kg = u.User_weight ?? null
  nutritionForm.value.height_cm = u.User_Height ?? null
  nutritionForm.value.allergies = u.User_Allergies ?? ''
  nutritionForm.value.dietary_preferences = u.User_Dietary_Preferences ?? ''
  if (u.User_Goals) nutritionForm.value.goal = mapGoal(u.User_Goals)

  workoutForm.value.age = age
  workoutForm.value.gender = gender
  workoutForm.value.weight_kg = u.User_weight ?? null
  workoutForm.value.height_cm = u.User_Height ?? null
  workoutForm.value.injuries = u.User_Injuries ?? ''
  if (u.User_Goals) workoutForm.value.goal = mapGoal(u.User_Goals)
})

function mapGoal(raw: string): string {
  const g = raw.toLowerCase()
  if (g.includes('loss') || g.includes('minceur') || g.includes('poids')) return 'weight_loss'
  if (g.includes('muscle') || g.includes('mass')) return 'muscle_gain'
  if (g.includes('endur')) return 'endurance'
  if (g.includes('maint')) return 'maintenance'
  return 'general_health'
}

// ── Appels API IA ──────────────────────────────────────────────────────────
async function fetchNutritionRecommendation() {
  if (!authStore.user) return
  nutritionLoading.value = true
  nutritionError.value = null
  nutritionResult.value = null

  const payload: Record<string, any> = {
    user_id: authStore.user.User_ID,
    nb_meals_per_day: nutritionForm.value.nb_meals_per_day,
    use_llm_enhancement: false,
  }

  const fields: Array<keyof typeof nutritionForm.value> = [
    'goal', 'activity_level', 'age', 'gender', 'weight_kg', 'height_cm',
    'budget_level', 'allergies', 'dietary_preferences'
  ]
  for (const f of fields) {
    const v = nutritionForm.value[f]
    if (v !== null && v !== '') payload[f] = v
  }

  try {
    const { data } = await axios.post(`${AI_BASE_URL}/api/v1/nutrition/recommend`, payload)
    nutritionResult.value = data
  } catch (err: any) {
    nutritionError.value = err.response?.data?.detail ?? 'Erreur lors de la génération du plan nutrition'
  } finally {
    nutritionLoading.value = false
  }
}

async function fetchWorkoutRecommendation() {
  if (!authStore.user) return
  workoutLoading.value = true
  workoutError.value = null
  workoutResult.value = null

  const payload: Record<string, any> = {
    user_id: authStore.user.User_ID,
    sessions_per_week: workoutForm.value.sessions_per_week,
    use_llm_enhancement: false,
  }

  const fields: Array<keyof typeof workoutForm.value> = [
    'goal', 'age', 'gender', 'weight_kg', 'height_cm',
    'preferred_duration_min', 'injuries'
  ]
  for (const f of fields) {
    const v = workoutForm.value[f]
    if (v !== null && v !== '') payload[f] = v
  }

  if (workoutForm.value.available_equipment.length > 0) {
    payload.available_equipment = workoutForm.value.available_equipment
  }

  try {
    const { data } = await axios.post(`${AI_BASE_URL}/api/v1/workout/recommend`, payload)
    workoutResult.value = data
  } catch (err: any) {
    workoutError.value = err.response?.data?.detail ?? 'Erreur lors de la génération du programme'
  } finally {
    workoutLoading.value = false
  }
}

// ── Helpers d'affichage ────────────────────────────────────────────────────
const fitnessLevelClass = computed(() => {
  const lvl = workoutResult.value?.fitness_level_detected
  if (lvl === 'beginner') return 'bg-success'
  if (lvl === 'intermediate') return 'bg-warning text-dark'
  if (lvl === 'advanced') return 'bg-danger'
  return 'bg-secondary'
})

const fitnessLevelLabel = computed(() => {
  const lvl = workoutResult.value?.fitness_level_detected
  if (lvl === 'beginner') return 'Débutant'
  if (lvl === 'intermediate') return 'Intermédiaire'
  if (lvl === 'advanced') return 'Avancé'
  return lvl ?? '–'
})

function workoutTypeLabel(type: string) {
  const map: Record<string, string> = {
    cardio: 'Cardio', strength: 'Musculation', hiit: 'HIIT',
    yoga: 'Yoga', flexibility: 'Souplesse', mixed: 'Mixte'
  }
  return map[type] ?? type
}

function workoutTypeClass(type: string) {
  const map: Record<string, string> = {
    cardio: 'bg-info text-dark', strength: 'bg-danger text-white',
    hiit: 'bg-warning text-dark', yoga: 'bg-success text-white',
    flexibility: 'bg-secondary text-white', mixed: 'bg-primary text-white'
  }
  return map[type] ?? 'bg-light'
}

function intensityLabel(lvl: string) {
  if (lvl === 'low') return 'Faible'
  if (lvl === 'moderate') return 'Modérée'
  if (lvl === 'high') return 'Intense'
  return lvl
}

function intensityBadge(lvl: string) {
  if (lvl === 'low') return 'bg-success'
  if (lvl === 'moderate') return 'bg-warning text-dark'
  if (lvl === 'high') return 'bg-danger'
  return 'bg-secondary'
}
</script>

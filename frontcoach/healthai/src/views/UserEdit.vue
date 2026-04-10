<template>
  <div class="container mt-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-outline-secondary me-3" @click="goBack">
        <i class="bi bi-arrow-left"></i> Retour
      </button>
      <h2 class="text-primary mb-0">{{ isEditing ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="saveUser">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input v-model="form.User_mail" type="email" class="form-control" required>
                  </div>
                  <div class="mb-3" v-if="!isEditing">
                    <label class="form-label">Mot de passe *</label>
                    <input v-model="form.User_password" type="password" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Âge</label>
                    <input v-model.number="form.User_age" type="number" class="form-control" min="1" max="150">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Poids (kg)</label>
                    <input v-model.number="form.User_weight" type="number" step="0.1" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Taille (cm)</label>
                    <input v-model.number="form.User_Height" type="number" step="0.1" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Genre</label>
                    <select v-model="form.User_gender" class="form-select">
                      <option value="">Non spécifié</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Type d'abonnement</label>
                    <select v-model="form.User_Subscription" class="form-select">
                      <option value="">Aucun</option>
                      <option value="Basic">Basic</option>
                      <option value="Premium">Premium</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Objectifs</label>
                    <textarea v-model="form.User_Goals" class="form-control" rows="3" placeholder="Objectifs de fitness..."></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Allergies</label>
                    <textarea v-model="form.User_Allergies" class="form-control" rows="2" placeholder="Allergies alimentaires..."></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Préférences diététiques</label>
                    <input v-model="form.User_Dietary_Preferences" type="text" class="form-control" placeholder="Végétarien, végan, etc.">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Budget alimentaire</label>
                    <select v-model="form.User_Budget_Level" class="form-select">
                      <option value="">Non spécifié</option>
                      <option value="Faible">Faible</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Élevé">Élevé</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Blessures</label>
                    <textarea v-model="form.User_Injuries" class="form-control" rows="2" placeholder="Blessures ou limitations..."></textarea>
                  </div>
                  <div class="mb-3" v-if="isEditing">
                    <div class="form-check">
                      <input v-model="form.isAdmin" type="checkbox" class="form-check-input" id="adminCheck">
                      <label class="form-check-label" for="adminCheck">Administrateur</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="userStore.loading">
                  <span v-if="userStore.loading" class="spinner-border spinner-border-sm me-2"></span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/users'

type UserForm = {
  User_mail: string
  User_password: string
  User_Subscription: string
  User_age: number | null
  User_weight: number | null
  User_Height: number | null
  User_gender: string
  User_Goals: string
  User_Allergies: string
  User_Dietary_Preferences: string
  User_Budget_Level: string
  User_Injuries: string
  isAdmin: boolean
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isEditing = computed(() => !!route.params.id)
const userId = computed(() => route.params.id ? parseInt(route.params.id as string, 10) : null)

const form = ref<UserForm>({
  User_mail: '',
  User_password: '',
  User_Subscription: '',
  User_age: null,
  User_weight: null,
  User_Height: null,
  User_gender: '',
  User_Goals: '',
  User_Allergies: '',
  User_Dietary_Preferences: '',
  User_Budget_Level: '',
  User_Injuries: '',
  isAdmin: false,
})

const loadUser = async () => {
  if (!userId.value) {
    return
  }

  const user = await userStore.fetchUser(userId.value)
  if (!user) {
    return
  }

  form.value = {
    User_mail: user.User_mail || '',
    User_password: '',
    User_Subscription: user.User_Subscription || '',
    User_age: user.User_age,
    User_weight: user.User_weight,
    User_Height: user.User_Height,
    User_gender: user.User_gender || '',
    User_Goals: user.User_Goals || '',
    User_Allergies: user.User_Allergies || '',
    User_Dietary_Preferences: user.User_Dietary_Preferences || '',
    User_Budget_Level: user.User_Budget_Level || '',
    User_Injuries: user.User_Injuries || '',
    isAdmin: user.isAdmin || false,
  }
}

const saveUser = async () => {
  try {
    if (isEditing.value && userId.value) {
      const updateData = {
        ...form.value,
        User_password: form.value.User_password || undefined,
      }
      await userStore.updateUser(userId.value, updateData)
      alert('Utilisateur modifié avec succès!')
    } else {
      await userStore.createUser(form.value)
      alert('Utilisateur créé avec succès!')
    }

    router.push('/users')
  } catch (error: any) {
    alert(error.response?.data?.detail || 'Une erreur est survenue')
  }
}

const goBack = () => {
  router.push('/users')
}

onMounted(() => {
  void loadUser()
})
</script>
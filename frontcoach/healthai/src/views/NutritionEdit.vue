<template>
  <div class="container mt-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-outline-secondary me-3" @click="goBack">
        <i class="bi bi-arrow-left"></i> Retour
      </button>
      <h2 class="text-primary mb-0">{{ isEditing ? 'Modifier' : 'Ajouter' }} un produit</h2>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Nom du produit *</label>
                    <input v-model="form.product_name" type="text" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Calories (kcal/100g)</label>
                    <input v-model.number="form.product_kcal" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Protéines (g/100g)</label>
                    <input v-model.number="form.product_protein" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Glucides (g/100g)</label>
                    <input v-model.number="form.product_carbs" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Lipides (g/100g)</label>
                    <input v-model.number="form.product_fat" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Fibres (g/100g)</label>
                    <input v-model.number="form.product_fiber" type="number" step="0.1" class="form-control" min="0">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Sucre (g/100g)</label>
                    <input v-model.number="form.product_sugar" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Sodium (mg/100g)</label>
                    <input v-model.number="form.product_sodium" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Cholestérol (mg/100g)</label>
                    <input v-model.number="form.product_chol" type="number" step="0.1" class="form-control" min="0">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Tags diététiques</label>
                    <input v-model="form.Product_Diet_Tags" type="text" class="form-control" 
                           placeholder="Bio, Sans gluten, Végan...">
                    <div class="form-text">Séparez les tags par des virgules</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Catégorie de prix</label>
                    <select v-model="form.Product_Price_Category" class="form-select">
                      <option value="">Non spécifiée</option>
                      <option value="Économique">Économique</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- Résumé nutritionnel -->
              <div class="row mt-3" v-if="hasNutritionalData">
                <div class="col-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Résumé nutritionnel (pour 100g)</h6>
                      <div class="row text-center">
                        <div class="col-md-3">
                          <div class="text-warning"><strong>{{ form.product_kcal || 0 }}</strong></div>
                          <small class="text-muted">kcal</small>
                        </div>
                        <div class="col-md-3">
                          <div class="text-danger"><strong>{{ form.product_protein || 0 }}g</strong></div>
                          <small class="text-muted">Protéines</small>
                        </div>
                        <div class="col-md-3">
                          <div class="text-primary"><strong>{{ form.product_carbs || 0 }}g</strong></div>
                          <small class="text-muted">Glucides</small>
                        </div>
                        <div class="col-md-3">
                          <div class="text-secondary"><strong>{{ form.product_fat || 0 }}g</strong></div>
                          <small class="text-muted">Lipides</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end mt-3">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="nutritionStore.loading">
                  <span v-if="nutritionStore.loading" class="spinner-border spinner-border-sm me-2"></span>
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
import { useNutritionStore } from '../stores/nutrition'

const router = useRouter()
const route = useRoute()
const nutritionStore = useNutritionStore()

const isEditing = computed(() => !!route.params.id)
const productId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)

const hasNutritionalData = computed(() => {
  return form.value.product_kcal || form.value.product_protein || form.value.product_carbs || form.value.product_fat
})

const form = ref({
  product_name: '',
  product_kcal: null as number | null,
  product_protein: null as number | null,
  product_carbs: null as number | null,
  product_fat: null as number | null,
  product_fiber: null as number | null,
  product_sugar: null as number | null,
  product_sodium: null as number | null,
  product_chol: null as number | null,
  Product_Diet_Tags: '',
  Product_Price_Category: ''
})

const loadProduct = async () => {
  if (productId.value && nutritionStore.products.length === 0) {
    await nutritionStore.fetchProducts()
  }
  
  if (productId.value) {
    const product = nutritionStore.products.find(p => p.Product_ID === productId.value)
    if (product) {
      form.value = {
        product_name: product.product_name || '',
        product_kcal: product.product_kcal,
        product_protein: product.product_protein,
        product_carbs: product.product_carbs,
        product_fat: product.product_fat,
        product_fiber: product.product_fiber,
        product_sugar: product.product_sugar,
        product_sodium: product.product_sodium,
        product_chol: product.product_chol,
        Product_Diet_Tags: product.Product_Diet_Tags || '',
        Product_Price_Category: product.Product_Price_Category || ''
      }
    }
  }
}

const saveProduct = async () => {
  try {
    if (isEditing.value && productId.value) {
      // Modification
      await nutritionStore.updateProduct(productId.value, form.value)
      alert('Produit modifié avec succès!')
    } else {
      // Création
      const productData = {
        ...form.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      await nutritionStore.createProduct(productData)
      alert('Produit créé avec succès!')
    }
    
    router.push('/nutrition')
  } catch (error: any) {
    alert(`Erreur: ${error.response?.data?.detail || 'Une erreur est survenue'}`)
  }
}

const goBack = () => {
  router.push('/nutrition')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>
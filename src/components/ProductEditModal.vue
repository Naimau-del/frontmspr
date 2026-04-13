<template>
  <div class="modal fade" id="productEditModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Modifier' : 'Ajouter' }} un produit</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="saveProduct">
          <div class="modal-body">
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
import type { Product } from '../services/api'

interface Props {
  product?: Product | null
  loading?: boolean
}

interface Emits {
  (e: 'save', product: any): void
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
  loading: false
})

const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.product)

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

const resetForm = () => {
  if (props.product) {
    form.value = {
      product_name: props.product.product_name || '',
      product_kcal: props.product.product_kcal,
      product_protein: props.product.product_protein,
      product_carbs: props.product.product_carbs,
      product_fat: props.product.product_fat,
      product_fiber: props.product.product_fiber,
      product_sugar: props.product.product_sugar,
      product_sodium: props.product.product_sodium,
      product_chol: props.product.product_chol,
      Product_Diet_Tags: props.product.Product_Diet_Tags || '',
      Product_Price_Category: props.product.Product_Price_Category || ''
    }
  } else {
    form.value = {
      product_name: '',
      product_kcal: null,
      product_protein: null,
      product_carbs: null,
      product_fat: null,
      product_fiber: null,
      product_sugar: null,
      product_sodium: null,
      product_chol: null,
      Product_Diet_Tags: '',
      Product_Price_Category: ''
    }
  }
}

const saveProduct = () => {
  emit('save', { ...form.value })
}

// Watch for product prop changes
import { watch } from 'vue'
watch(() => props.product, resetForm, { immediate: true })
</script>
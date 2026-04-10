import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type Product } from '../services/api'

export const useNutritionStore = defineStore('nutrition', () => {
  // State
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentProduct = ref<Product | null>(null)

  // Filters
  const filters = ref({
    search: '',
    dietTags: '',
    priceCategory: ''
  })

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Getters
  const nutritionStats = computed(() => {
    const total = products.value.length
    const dietTags = new Set(products.value.map(p => p.Product_Diet_Tags || 'Aucun')).size
    const priceCategories = new Set(products.value.map(p => p.Product_Price_Category || 'Non spécifiée')).size

    return {
      total,
      dietTags,
      priceCategories,
      averageCalories: products.value.length > 0 
        ? Math.round(products.value.reduce((sum, p) => sum + (p.product_kcal || 0), 0) / total)
        : 0
    }
  })

  const filteredProducts = computed(() => {
    let filtered = products.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(search) ||
        (product.Product_Diet_Tags && product.Product_Diet_Tags.toLowerCase().includes(search)) ||
        (product.Product_Price_Category && product.Product_Price_Category.toLowerCase().includes(search))
      )
    }

    if (filters.value.dietTags) {
      filtered = filtered.filter(product => 
        (product.Product_Diet_Tags || 'Aucun') === filters.value.dietTags
      )
    }

    if (filters.value.priceCategory) {
      filtered = filtered.filter(product => 
        (product.Product_Price_Category || 'Non spécifiée') === filters.value.priceCategory
      )
    }

    return filtered
  })

  const totalProducts = computed(() => filteredProducts.value.length)
  const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage.value))
  
  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredProducts.value.slice(start, end)
  })

  const dietTags = computed(() => {
    const tags = [...new Set(products.value.map(p => p.Product_Diet_Tags || 'Aucun'))]
    return tags.sort()
  })

  const priceCategories = computed(() => {
    const categories = [...new Set(products.value.map(p => p.Product_Price_Category || 'Non spécifiée'))]
    return categories.sort()
  })

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    
    try {
      products.value = await apiService.getAllProducts()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des produits'
      console.error('Erreur fetch products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      currentProduct.value = await apiService.getProduct(id)
      return currentProduct.value
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement du produit'
      console.error('Erreur fetch product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData: Omit<Product, 'Product_ID'>) => {
    loading.value = true
    error.value = null
    
    try {
      const newProduct = await apiService.createProduct(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création du produit'
      console.error('Erreur create product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedProduct = await apiService.updateProduct(id, productData)
      
      // Mettre à jour dans la liste
      const index = products.value.findIndex(p => p.Product_ID === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      
      // Mettre à jour le produit courant si c'est le même
      if (currentProduct.value && currentProduct.value.Product_ID === id) {
        currentProduct.value = updatedProduct
      }
      
      return updatedProduct
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour'
      console.error('Erreur update product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      await apiService.deleteProduct(id)
      
      // Supprimer de la liste locale
      products.value = products.value.filter(p => p.Product_ID !== id)
      
      // Réinitialiser le produit courant si c'était lui
      if (currentProduct.value && currentProduct.value.Product_ID === id) {
        currentProduct.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la suppression'
      console.error('Erreur delete product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<typeof filters.value>) => {
    Object.assign(filters.value, newFilters)
    currentPage.value = 1 // Reset pagination
  }

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const setItemsPerPage = (items: number) => {
    itemsPerPage.value = items
    currentPage.value = 1 // Reset pagination
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,
    filters,
    currentPage,
    itemsPerPage,
    // Getters
    nutritionStats,
    filteredProducts,
    totalProducts,
    totalPages,
    paginatedProducts,
    dietTags,
    priceCategories,
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    setPage,
    setItemsPerPage,
    clearError,
    clearCurrentProduct
  }
})
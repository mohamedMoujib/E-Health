import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for API interactions
export const fetchAllArticles = createAsyncThunk(
  'articles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/articles`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch articles');
    }
  }
);

export const fetchArticleById = createAsyncThunk(
  'articles/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/articles/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch article');
    }
  }
);

export const fetchArticlesByDoctor = createAsyncThunk(
  'articles/fetchByDoctor',
  async (_, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) { 
        return rejectWithValue("No access token available");
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/articles/myarticles/`,
        { 
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to fetch doctor articles';
      
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object' && error.response.data !== null
          ? error.response.data.message || errorMessage
          : error.response.data;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchArticlesByCategory = createAsyncThunk(
  'articles/fetchByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/articles/category/${category}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch category articles');
    }
  }
);

// In your Redux slice:
export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async ({ articleData }, { getState, rejectWithValue }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) { 
        return rejectWithValue("No access token available");
      }
      
      // Log the FormData contents for debugging
    console.log('FormData contents:', articleData.get('titre'), articleData.get('description'), articleData.get('categorie'), articleData.get('image'));
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/articles/`,
        articleData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',

          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fix for the updateArticle thunk in articlesSlice.js
export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, articleData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/articles/${id}`, 
        articleData,
        
        
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? error.response.data.message || 'Failed to update article' 
          : error.response?.data || 'Failed to update article'
      );
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().auth.accessToken;
      if (!accessToken) {
        return rejectWithValue("No access token available");
      }
      
      await axios.delete(`${process.env.REACT_APP_API_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? error.response.data.message || 'Failed to delete article' 
          : error.response?.data || 'Failed to delete article'
      );
    }
  }
);

// Initial state
const initialState = {
  articles: [],
  currentArticle: null,
  filteredArticles: [],
  loading: false,
  error: null,
  success: null
};

// Create the slice
const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    setFilteredArticles: (state, action) => {
      state.filteredArticles = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllArticles
      .addCase(fetchAllArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.filteredArticles = action.payload;
      })
      .addCase(fetchAllArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch articles';
      })
      
      // Handle fetchArticleById
      .addCase(fetchArticleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch article details';
      })
      
      // Handle fetchArticlesByDoctor
      .addCase(fetchArticlesByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticlesByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredArticles = action.payload;
      })
      .addCase(fetchArticlesByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctor articles';
      })
      
      // Handle fetchArticlesByCategory
      .addCase(fetchArticlesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticlesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredArticles = action.payload;
      })
      .addCase(fetchArticlesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category articles';
      })
      
      // Handle createArticle
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles.push(action.payload);
        state.currentArticle = action.payload;
        state.success = 'Article créé avec succès';
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create article';
      })
      
      // Handle updateArticle
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.map(article => 
          article._id === action.payload._id ? action.payload : article
        );
        state.currentArticle = action.payload;
        state.success = 'Article mis à jour avec succès';
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update article';
      })
      
      // Handle deleteArticle
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.filter(article => article._id !== action.payload);
        state.filteredArticles = state.filteredArticles.filter(article => article._id !== action.payload);
        state.success = 'Article supprimé avec succès';
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete article';
      });
  },
});

// Export actions and reducer
export const { clearErrors, clearSuccess, clearCurrentArticle, setFilteredArticles } = articlesSlice.actions;
export default articlesSlice.reducer;
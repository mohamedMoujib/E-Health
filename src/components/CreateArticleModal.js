import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createArticle,
  updateArticle,
  clearCurrentArticle,
  fetchAllArticles,
  fetchArticlesByDoctor
} from '../Redux/slices/articlesSlice';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

// Couleur bleu marine personnalisée
const NAVY_BLUE = '#0A192F';

const categories = [
  'general',
  'pediatrics',
  'cardiology',
  'neurology',
  'orthopedics',
  'dermatology',
  'Médecine alternative',
  'Recherche biomédicale',
  'Actualités COVID-19',
  'Alimentation et nutrition',
  'Santé numérique',
  'Soins aux handicapés',
  'Exercice et fitness',
  'Génétique',
  'Pratiques infirmières',
  'Néonatologie',
  'autre'
];

const CreateArticleModal = ({ open, onClose, editArticle = null, onArticleAdded }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEditMode = !!editArticle;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    imageFile: null,
    imageUrl: ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editArticle) {
      setFormData({
        title: editArticle.titre,
        content: editArticle.description,
        category: editArticle.categorie,
        imageFile: null,
        imageUrl: editArticle.image || ''
      });
    } else {
      // Reset form when opening in create mode
      setFormData({
        title: '',
        content: '',
        category: 'general',
        imageFile: null,
        imageUrl: ''
      });
    }
  }, [editArticle, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.title);
      formDataToSend.append('description', formData.content);
      formDataToSend.append('categorie', formData.category);
      
      if (formData.imageFile && formData.imageFile instanceof File) {
        formDataToSend.append('image', formData.imageFile);
      }

      if (isEditMode) {
        await dispatch(updateArticle({ 
          id: editArticle._id, 
          articleData: formDataToSend 
        }));
      } else {
        await dispatch(createArticle({ 
          articleData: formDataToSend 
        }));
      }
      
      setUploadProgress(100);
      
      // Refresh articles
      dispatch(fetchAllArticles());
      dispatch(fetchArticlesByDoctor());
      
      // Callback for parent components
      if (onArticleAdded) {
        onArticleAdded();
      }
      
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'article:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleClose = () => {
    setUploadProgress(0);
    setIsUploading(false);
    dispatch(clearCurrentArticle());
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          px: 3,
          py: 2,
          bgcolor: NAVY_BLUE,
          color: 'white',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {isEditMode ? 'Modifier l\'article' : 'Créer un nouvel article'}
        </Typography>
        <IconButton
          edge="end"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 4, marginTop: 4 }}>
        <form id="articleForm" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel 
                  id="category-label"
                  sx={{
                    '&.Mui-focused': {
                      color: NAVY_BLUE
                    }
                  }}
                >Catégorie</InputLabel>
                <Select
                  labelId="category-label"
                  label="Catégorie"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'capitalize',
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: NAVY_BLUE
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<ImageIcon />}
                sx={{
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  borderColor: NAVY_BLUE,
                  color: NAVY_BLUE,
                  '&:hover': {
                    backgroundColor: alpha(NAVY_BLUE, 0.05),
                    borderColor: NAVY_BLUE
                  }
                }}
              >
                Télécharger une image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                {formData.imageFile ? formData.imageFile.name : 'Aucun fichier sélectionné'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contenu"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                multiline
                rows={8}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NAVY_BLUE
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: NAVY_BLUE
                  }
                }}
              />
            </Grid>  
            {formData.imageUrl && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(NAVY_BLUE, 0.2),
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ color: NAVY_BLUE, fontWeight: 600 }}>
                    Aperçu de l'image:
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundImage: `url(${formData.imageUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1),
                    }}
                  />
                </Paper>
              </Grid>
            )}       
            {isUploading && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Téléchargement: {uploadProgress}%
                  </Typography>
                  <Box sx={{ width: '100%', height: 8, bgcolor: alpha(NAVY_BLUE, 0.1), borderRadius: 4 }}>
                    <Box 
                      sx={{ 
                        width: `${uploadProgress}%`, 
                        height: '100%', 
                        bgcolor: NAVY_BLUE,
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          disabled={isUploading}
          sx={{ 
            borderRadius: 2,
            px: 3,
            borderColor: NAVY_BLUE,
            color: NAVY_BLUE,
            '&:hover': {
              backgroundColor: alpha(NAVY_BLUE, 0.05),
              borderColor: NAVY_BLUE
            }
          }}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          form="articleForm"
          disabled={isUploading}
          sx={{ 
            borderRadius: 2,
            px: 3,
            bgcolor: NAVY_BLUE,
            '&:hover': {
              bgcolor: alpha(NAVY_BLUE, 0.9)
            }
          }}
        >
          {isEditMode ? 'Mettre à jour' : 'Créer l\'article'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateArticleModal;
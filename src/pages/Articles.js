import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllArticles,
  fetchArticlesByDoctor,
  createArticle,
  updateArticle,
  deleteArticle,
  clearErrors,
  clearSuccess,
  clearCurrentArticle,
} from '../Redux/slices/articlesSlice';
import { format } from 'date-fns';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Pagination,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  CalendarMonth as CalendarIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkFilledIcon,
  BookmarkBorder as BookmarkIcon,
  Share as ShareIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Couleur bleu marine personnalisée
const NAVY_BLUE = '#0A192F';

const Articles = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    articles,
    filteredArticles,
    currentArticle,
    loading,
    error,
    success
  } = useSelector((state) => state.articles);

  const [openForm, setOpenForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuArticle, setMenuArticle] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewLayout, setViewLayout] = useState('cards');
  const [savedArticles, setSavedArticles] = useState([]);
  const articlesPerPage = 5;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    imageFile: null,
    imageUrl: ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [expandedArticles, setExpandedArticles] = useState({});
  
  const { user } = useSelector((state) => state.auth);

  const toggleExpandArticle = (articleId) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const categories = [
    'all',
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

  useEffect(() => {
    dispatch(fetchAllArticles());
    setSavedArticles(['mockid1', 'mockid2']);
  }, [dispatch]);

  useEffect(() => {
    if (viewMode === 'my') {
      const promise = dispatch(fetchArticlesByDoctor());
      promise.unwrap().catch(err => {
        const errorMsg = safeErrorMessage(err);
        if (errorMsg.includes("No access token") || errorMsg.includes("unauthorized")) {
          setViewMode('all');
          dispatch(fetchAllArticles());
        }
      });
    } else {
      dispatch(fetchAllArticles());
    }
  }, [dispatch, viewMode]);

  const handleOpenCreateForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      imageFile: null,
      imageUrl: ''
    });
    setIsEditMode(false);
    setOpenForm(true);
  };

  const handleOpenEditForm = (article) => {
    setFormData({
      title: article.titre,
      content: article.description,
      category: article.categorie,
      imageFile: null,
      imageUrl: article.image || ''
    });
    setIsEditMode(true);
    setEditingArticleId(article._id);
    setOpenForm(true);
    handleCloseMenu();
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingArticleId(null);
    dispatch(clearCurrentArticle());
    setUploadProgress(0);
    setIsUploading(false);
  };

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

      if (isEditMode && editingArticleId) {
        await dispatch(updateArticle({ 
          id: editingArticleId, 
          articleData: formDataToSend 
        }));
      } else {
        await dispatch(createArticle({ 
          articleData: formDataToSend 
        }));
      }
      
      setUploadProgress(100);
      dispatch(fetchArticlesByDoctor());
      dispatch(fetchAllArticles());
      
      setTimeout(() => {
        handleCloseForm();
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
  
  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setOpenDeleteDialog(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = () => {
    dispatch(deleteArticle(articleToDelete._id));
    setOpenDeleteDialog(false);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearErrors());
    dispatch(clearSuccess());
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuClick = (event, article) => {
    setAnchorEl(event.currentTarget);
    setMenuArticle(article);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    handleFilterClose();
  };
  
  const toggleSaveArticle = (articleId) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };
  
  const safeErrorMessage = (error) => {
    if (!error) return 'Une erreur est survenue';
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error.message) return error.message;
    return 'Une erreur est survenue';
  };
  
  const filteredByCategory = categoryFilter === 'all' 
    ? filteredArticles 
    : filteredArticles.filter(article => article.categorie === categoryFilter);

  const sortedArticles = [...filteredByCategory].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastArticle = page * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const pageCount = Math.ceil(sortedArticles.length / articlesPerPage);

  const getAvatarColor = (name) => {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f',
      '#e67e22', '#e74c3c', NAVY_BLUE, '#16a085', '#27ae60'
    ];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return 'IN';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderCardView = (article) => {
    const isExpanded = expandedArticles[article._id];
    const maxLength = 250;
    const isAuthor = user && user._id === article.idDoctor?._id;
  
    return (
      <Card 
        key={article._id} 
        sx={{ 
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1)
        }}
      >
        <CardHeader
          avatar={
            <Avatar 
              sx={{ 
                bgcolor: getAvatarColor(article.idDoctor?.firstName || ''),
                width: 40,
                height: 40
              }}
            >
              {article.idDoctor?.image ? (
                <img 
                  src={article.idDoctor?.image} 
                  alt={`${article.idDoctor?.firstName || ''}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(`${article.idDoctor?.firstName || ''} ${article.idDoctor?.lastName || ''}`)
              )}
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {article.idDoctor?.firstName || 'Inconnu'}{' '}{article.idDoctor?.lastName || ''}
              </Typography>
              <Chip
                label={article.categorie}
                size="small"
                sx={{ 
                  textTransform: 'capitalize',
                  borderRadius: 1,
                  backgroundColor: alpha(NAVY_BLUE, 0.1),
                  color: NAVY_BLUE,
                  fontWeight: 500,
                  height: 24
                }}
              />
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(article.createdAt), 'd MMM yyyy')}
              </Typography>
            </Box>
          }
          action={
            (viewMode === 'my' || isAuthor) && (
              <IconButton 
                aria-label="paramètres" 
                onClick={(e) => handleMenuClick(e, article)}
                sx={{ color: NAVY_BLUE }}
              >
                <MoreVertIcon />
              </IconButton>
            )
          }
        />
        
        {article.image && (
          <CardMedia
            component="img"
            height="240"
            src={article.image}
            sx={{ 
              objectFit: 'cover',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1)
            }}
          />
        )}  
        
        <CardContent sx={{ pt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: NAVY_BLUE, mb: 2 }}>
            {article.titre}
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3 }}>
            {isExpanded ? article.description : truncateText(article.description, maxLength)}
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {article.description.length > maxLength && (
            <Button 
              onClick={() => toggleExpandArticle(article._id)}
              size="small"
              variant="outlined" 
              sx={{ 
                marginLeft: 80,
                borderRadius: 2,
                backgroundColor: alpha(NAVY_BLUE, 0.05),
                borderColor: NAVY_BLUE,
                color: NAVY_BLUE,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(NAVY_BLUE, 0.1),
                  borderColor: NAVY_BLUE,
                }
              }}
            >
              {isExpanded ? 'Voir moins' : 'Lire plus'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.default,
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
        }}
      >
        {/* En-tête */}
        <Box
          sx={{
            p: 4,
            background: alpha(NAVY_BLUE, 0.03),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: 'relative',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArticleIcon 
                  sx={{ 
                    color: NAVY_BLUE, 
                    mr: 1.5, 
                    fontSize: 28 
                  }} 
                />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: NAVY_BLUE }}>
                  Articles Médicaux
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Découvrez et partagez les dernières connaissances médicales
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button
                  variant={viewMode === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('all')}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    bgcolor: viewMode === 'all' ? NAVY_BLUE : 'transparent',
                    borderColor: NAVY_BLUE,
                    color: viewMode === 'all' ? 'white' : NAVY_BLUE,
                    '&:hover': {
                      bgcolor: viewMode === 'all' ? alpha(NAVY_BLUE, 0.9) : alpha(NAVY_BLUE, 0.05),
                      borderColor: NAVY_BLUE,
                    }
                  }}
                >
                  Tous les articles
                </Button>
                <Button
                  variant={viewMode === 'my' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('my')}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    bgcolor: viewMode === 'my' ? NAVY_BLUE : 'transparent',
                    borderColor: NAVY_BLUE,
                    color: viewMode === 'my' ? 'white' : NAVY_BLUE,
                    '&:hover': {
                      bgcolor: viewMode === 'my' ? alpha(NAVY_BLUE, 0.9) : alpha(NAVY_BLUE, 0.05),
                      borderColor: NAVY_BLUE,
                    }
                  }}
                >
                  Mes articles
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleFilterClick}
                  startIcon={<FilterListIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    borderColor: NAVY_BLUE,
                    color: NAVY_BLUE,
                    '&:hover': {
                      backgroundColor: alpha(NAVY_BLUE, 0.05),
                      borderColor: NAVY_BLUE,
                    }
                  }}
                >
                  Filtrer
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateForm}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    bgcolor: NAVY_BLUE,
                    '&:hover': {
                      bgcolor: alpha(NAVY_BLUE, 0.9)
                    }
                  }}
                >
                  Nouvel article
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Menu Filtre */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          TransitionComponent={Fade}
          PaperProps={{
            sx: {
              mt: 1.5,
              border: `1px solid ${alpha(NAVY_BLUE, 0.1)}`,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold', color: NAVY_BLUE }}>
            Filtrer par catégorie
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {categories.map((category) => (
            <MenuItem 
              key={category} 
              onClick={() => handleCategoryChange(category)}
              selected={categoryFilter === category}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(NAVY_BLUE, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(NAVY_BLUE, 0.15),
                  }
                },
                '&:hover': {
                  backgroundColor: alpha(NAVY_BLUE, 0.05),
                }
              }}
            >
              <Typography 
                sx={{ 
                  textTransform: 'capitalize',
                  fontWeight: categoryFilter === category ? 'bold' : 'normal',
                  color: categoryFilter === category ? NAVY_BLUE : 'text.primary'
                }}
              >
                {category}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        {categoryFilter !== 'all' && (
          <Box sx={{ px: 3, pt: 3, pb: 0 }}>
            <Chip 
              label={`Catégorie: ${categoryFilter}`}
              onDelete={() => setCategoryFilter('all')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'capitalize',
                backgroundColor: alpha(NAVY_BLUE, 0.1),
                color: NAVY_BLUE,
                borderColor: alpha(NAVY_BLUE, 0.3),
                '& .MuiChip-deleteIcon': {
                  color: NAVY_BLUE,
                  '&:hover': {
                    color: alpha(NAVY_BLUE, 0.7),
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Liste des articles */}
        <Box sx={{ p: 3 }}>
          {loading && !filteredArticles.length ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Chargement des articles...</Typography>
            </Box>
          ) : currentArticles.length === 0 ? (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, backgroundColor: alpha(NAVY_BLUE, 0.05) }}>
              <Typography variant="h6" sx={{ color: NAVY_BLUE }}>Aucun article trouvé</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
              {categoryFilter !== 'all' ? 'Essayez de changer votre filtre de catégorie' : 'Soyez le premier à créer un article'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenCreateForm}
                sx={{ 
                  mt: 3,
                  bgcolor: NAVY_BLUE,
                  '&:hover': {
                    bgcolor: alpha(NAVY_BLUE, 0.9)
                  },
                  borderRadius: 2
                }}
              >
                Créer un nouvel article
              </Button>
            </Card>
          ) : (
            <Stack spacing={3}>
              {currentArticles.map((article) => (
                 renderCardView(article) 
              ))}
            </Stack>
          )}
          
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    mx: 0.5,
                    color: NAVY_BLUE,
                    borderColor: alpha(NAVY_BLUE, 0.3),
                    '&:hover': {
                      backgroundColor: alpha(NAVY_BLUE, 0.05),
                    }
                  },
                  '& .MuiPaginationItem-page.Mui-selected': {
                    backgroundColor: NAVY_BLUE,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: alpha(NAVY_BLUE, 0.9),
                    }
                  },
                  '& .MuiPaginationItem-ellipsis': {
                    color: NAVY_BLUE
                  },
                  '& .MuiSvgIcon-root': {
                    color: NAVY_BLUE
                  }
                }}
                size="large"
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Menu Article */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: `1px solid ${alpha(NAVY_BLUE, 0.1)}`
          }
        }}
      >
        <MenuItem 
          onClick={() => handleOpenEditForm(menuArticle)}
          sx={{
            '&:hover': {
              backgroundColor: alpha(NAVY_BLUE, 0.05)
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1, color: NAVY_BLUE }} />
          <Typography sx={{ color: NAVY_BLUE }}>Modifier</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteClick(menuArticle)} 
          sx={{ 
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha('#ff0000', 0.05)
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>Supprimer</Typography>
        </MenuItem>
      </Menu>

      {/* Formulaire Article */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
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
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 4 , marginTop:4 }}>
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
                    {categories.slice(1).map((cat) => (
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
            onClick={handleCloseForm}
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

      {/* Confirmation de suppression */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: NAVY_BLUE, 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Supprimer l'article
        </DialogTitle>
        <DialogContent sx={{ pt: 3, mt: 1 }}>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer l'article "{articleToDelete?.titre}"?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: alpha(NAVY_BLUE, 0.3),
              color: NAVY_BLUE,
              '&:hover': {
                borderColor: NAVY_BLUE,
                backgroundColor: alpha(NAVY_BLUE, 0.05)
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              backgroundColor: NAVY_BLUE,
              color: 'white',
              '&:hover': {
                backgroundColor: alpha(NAVY_BLUE, 0.9)
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper
          elevation={6}
          sx={{
            py: 1.5,
            px: 2,
            backgroundColor: error ? 'error.main' : NAVY_BLUE,
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography sx={{ mr: 2 }}>
            {error 
              ? (typeof error === 'object' && error !== null 
                ? error.message || 'Une erreur est survenue' 
                : error) 
              : success}
          </Typography>  
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Snackbar>
    </Container>
  );
};

export default Articles;
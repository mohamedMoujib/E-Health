import React, { useState, useEffect } from "react";
import {
  Logout,
  Visibility,
  CheckCircle,
  Delete
} from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Paper,
  TableContainer,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import DoctorDetails from "./DoctorDetails";
import { useAuth } from "../../contexts/AuthContext";

const theme = createTheme({
  palette: {
    primary: { main: "#0A192F", contrastText: "#FFFFFF" },
    secondary: { main: "#00B4D8" },
    background: { default: "#F8F9FA", paper: "#FFFFFF" }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none", borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: "#F1F5F9" }
      }
    }
  }
});

const specialities = [
  "Cardiologue", "Dentiste", "Dermatologue", "Generaliste", "Gynecologue",
  "Neurologue", "Ophtalmologiste", "Orthopedique", "Pediatre", "Psychiatre",
  "Radiologue", "Urologue", "Sexologue", "Orl", "Gastro", "Rhumatologue",
  "Nephrologie", "Pneumologue", "Nutritionniste"
];

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionType, setActionType] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/pending`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des médecins :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSpecialityChange = (event) => {
    setSelectedSpeciality(event.target.value);
  };

  const filteredDoctors = doctors
    .filter((doctor) => {
      const matchesSearch =
        doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpeciality =
        selectedSpeciality === "" || doctor.speciality === selectedSpeciality;

      return matchesSearch && matchesSpeciality;
    })
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });

  const handleViewDetails = (doctor) => {
    setSelectedDoctorDetails(doctor);
    setDetailsOpen(true);
  };

  const handleConfirmDoctor = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin/confirm`, { idDoctor: selectedDoctor._id });
      fetchDoctors();
      setOpenDialog(false);
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/delete`, {
        data: { idDoctor: selectedDoctor._id }
      });
      fetchDoctors();
      setOpenDialog(false);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleActionClick = (doctor, type) => {
    setSelectedDoctor(doctor);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "background.default" }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Tableau de bord Administrateur
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{ textTransform: "none", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
            >
              Déconnexion
            </Button>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ py: 4, flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", color: "primary.main" }}>
              Gestion des médecins
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField
                placeholder="Rechercher un médecin..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
                sx={{ width: 250, backgroundColor: "background.paper" }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="speciality-label">Spécialité</InputLabel>
                <Select
                  labelId="speciality-label"
                  value={selectedSpeciality}
                  label="Spécialité"
                  onChange={handleSpecialityChange}
                >
                  <MenuItem value="">Toutes les spécialités</MenuItem>
                  {specialities.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.1)", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Spécialité</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor._id} hover>
                        <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.speciality}</TableCell>
                        <TableCell>
                          <Chip
                            label={doctor.status === "valide" ? "Actif" : "En attente"}
                            color={doctor.status === "valide" ? "success" : "warning"}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              ...(doctor.status === "valide" && {
                                backgroundColor: "#E6F7F0",
                                color: "#00A76F"
                              }),
                              ...(doctor.status === "pending" && {
                                backgroundColor: "#FFF7E6",
                                color: "#FF9500"
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewDetails(doctor)}
                            startIcon={<Visibility />}
                            size="small"
                          >
                            Détails
                          </Button>
                          {doctor.status !== "valide" && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleActionClick(doctor, "confirm")}
                                startIcon={<CheckCircle />}
                                size="small"
                                sx={{ backgroundColor: "#00A76F", "&:hover": { backgroundColor: "#007867" } }}
                              >
                                Valider
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleActionClick(doctor, "delete")}
                                startIcon={<Delete />}
                                size="small"
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Aucun médecin trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {actionType === "confirm" ? "Confirmer le médecin" : "Supprimer le médecin"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionType === "confirm"
                ? `Êtes-vous sûr de vouloir confirmer ${selectedDoctor?.firstName} ${selectedDoctor?.lastName} ?`
                : `Êtes-vous sûr de vouloir supprimer ${selectedDoctor?.firstName} ${selectedDoctor?.lastName} ? Cette action est irréversible.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              onClick={actionType === "confirm" ? handleConfirmDoctor : handleDeleteDoctor}
              color={actionType === "confirm" ? "success" : "error"}
              autoFocus
            >
              {actionType === "confirm" ? "Confirmer" : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>

        <DoctorDetails
          doctor={selectedDoctorDetails}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;

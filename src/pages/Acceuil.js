import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, Clock, Plus, UserPlus, MessageSquare, CheckCircle, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Acceuil.css';
import { getDoctorAppointments } from '../Redux/slices/appointmentSlice';
import { fetchUserProfile } from '../Redux/slices/userSlice';
import GlobalAppointmentModal from '../components/GlobalAppointmentModal';
import CreateArticleModal from '../components/CreateArticleModal';
import { fetchPatientsList } from '../Redux/slices/patientsSlice';
import { BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const patientDemographicsData = [
  { ageGroup: '0-10', count: 12 },
  { ageGroup: '11-20', count: 18 },
  { ageGroup: '21-30', count: 29 },
  { ageGroup: '31-40', count: 38 },
  { ageGroup: '41-50', count: 32 },
  { ageGroup: '51-60', count: 27 },
  { ageGroup: '61-70', count: 21 },
  { ageGroup: '71+', count: 15 }
];

const Acceuil = () => {
  const dispatch = useDispatch();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [monthlyAppointmentData, setMonthlyAppointmentData] = useState([]);
  const [welcomeText, setWelcomeText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  
  const userState = useSelector(state => state.user) || { profile: null, loading: false };
  const { profile, loading: userLoading } = userState;
  const { appointments, loading: appointmentsLoading } = useSelector(state => state.appointments);
  const { list, loading: patientsLoading } = useSelector(state => state.patients) || { list: [], loading: false };
  // Add notifications from Redux store
  const { notifications, unreadCount, loading: notificationsLoading } = useSelector(state => state.notifications);

  // Filter unread notifications by type
  const unreadMessageNotifications = notifications.filter(
    notification => !notification.isRead && notification.type === 'message'
  );
  
  const unreadAppointmentNotifications = notifications.filter(
    notification => !notification.isRead && notification.type === 'appointment'
  );

  useEffect(() => {
    if (appointments?.length) {
      const processedData = processMonthlyAppointments(appointments);
      setMonthlyAppointmentData(processedData);
    }
  }, [appointments]);

  const getDoctorName = () => {
    if (userLoading) return 'Chargement...';
    if (!profile) return 'Docteur';
    return `Dr. ${profile.lastName || ''}`;
  };

  useEffect(() => {
    const fullWelcomeText = `Bienvenue, ${getDoctorName()}`;
    let currentWelcomeIndex = 0;
    
    const welcomeInterval = setInterval(() => {
      if (currentWelcomeIndex <= fullWelcomeText.length) {
        setWelcomeText(fullWelcomeText.slice(0, currentWelcomeIndex));
        currentWelcomeIndex++;
      } else {
        clearInterval(welcomeInterval);
        animateSubtitle();
      }
    }, 50);
    
    const animateSubtitle = () => {
      const todayApptsCount = appointments?.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        const today = new Date();
        return appointmentDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
      })?.length || 0;
      
      const fullSubtitleText = `Vous avez ${todayApptsCount} rendez-vous aujourd'hui`;
      let currentSubtitleIndex = 0;
      
      const subtitleInterval = setInterval(() => {
        if (currentSubtitleIndex <= fullSubtitleText.length) {
          setSubtitleText(fullSubtitleText.slice(0, currentSubtitleIndex));
          currentSubtitleIndex++;
        } else {
          clearInterval(subtitleInterval);
        }
      }, 50);
      
      return () => clearInterval(subtitleInterval);
    };
    
    return () => clearInterval(welcomeInterval);
  }, [profile, appointments]);

  const processMonthlyAppointments = (appointmentsData) => {
    const monthsData = {};
    
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const currentDate = new Date();
    let startMonth = currentDate.getMonth() + 1;
    let startYear = currentDate.getFullYear() - 1;
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i) % 12;
      const year = startYear + Math.floor((startMonth + i) / 12);
      const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
      monthsData[monthKey] = {
        month: monthNames[monthIndex],
        appointments: 0,
        fullDate: monthKey
      };
    }
    
    appointmentsData.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const monthKey = `${appointmentDate.getFullYear()}-${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (monthsData[monthKey]) {
        monthsData[monthKey].appointments += 1;
      }
    });
    
    return Object.values(monthsData);
  };

  const pendingAppointmentsCount = appointments?.filter(appointment => appointment.status === 'pending').length || 0;

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(getDoctorAppointments());
    dispatch(fetchPatientsList());
  }, [dispatch]);

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
  };

  const handleOpenArticleModal = () => {
    setIsArticleModalOpen(true);
  };

  const handleCloseArticleModal = () => {
    setIsArticleModalOpen(false);
  };

  const handleAppointmentAdded = () => {
    dispatch(getDoctorAppointments());
  };

  const handleArticleAdded = () => {
    console.log('Article ajouté avec succès');
  };

  const todayAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  }) || [];

  const upcomingAppointments = appointments
    ?.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const appointmentDateTime = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
      const now = new Date();
      
      // Include appointments from today (even if the time has passed) and future dates
      return (
        // Same day but future time OR future date
        (appointmentDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0) && 
         appointmentDateTime >= new Date()) || // Today but not passed yet
        (new Date(appointment.date) > new Date()) // Future date
      );
    })
    .sort((a, b) => {
      // Create datetime objects for proper sorting
      const dateTimeA = new Date(`${a.date.split('T')[0]}T${a.time}`);
      const dateTimeB = new Date(`${b.date.split('T')[0]}T${b.time}`);
      return dateTimeA - dateTimeB;
    })
    .slice(0, 3) || [];

  const getStatusBadgeClass = (status) => {
    return status === 'confirmed' ? 'status-badge confirmed' : 'status-badge pending';
  };
  const handleViewAppointment = (appointment) => {
    navigate(`/dashboard/Patients/${appointment.patient._id}/appointments`, { state: { appointment } });
  };
  const navigate = useNavigate(); // Add this line at the top inside your component

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-grid">
          
          {/* Section de bienvenue */}
          <div className="welcome-section">
            <div className="welcome-content">
              <div>
                <h1 className="welcome-title">
                  {welcomeText}
                  <span className="typing-cursor">|</span>
                </h1>
                <p className="welcome-subtitle">
                  {subtitleText}
                  {subtitleText && subtitleText.length < `Vous avez ${todayAppointments.length} rendez-vous aujourd'hui`.length && 
                    <span className="typing-cursor">|</span>
                  }
                </p>
              </div>
              <div className="welcome-actions">
                <button 
                  className="btn btn-blue"
                  onClick={handleOpenArticleModal}
                >
                  <Plus size={18} className="btn-icon" />
                  Ajouter un article
                </button>
                <button 
                  className="btn btn-blue"
                  onClick={handleOpenAppointmentModal}
                >
                  <Plus size={18} className="btn-icon" />
                  Nouveau rendez-vous
                </button>
                <button className="btn btn-blue">
                  <UserPlus size={18} className="btn-icon" />
                  Ajouter un patient
                </button>
              </div>
            </div>
          </div>
           
           {/* Rendez-vous à venir */}
           <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Clock size={20} className="card-title-icon" />
                Rendez-vous à venir
              </h2>
            </div>
            <div className="upcoming-list">
              {appointmentsLoading ? (
                <div className="loading-indicator">Chargement des rendez-vous...</div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => {
                  const appointmentDate = new Date(appointment.date);
                  
                  return (
                    <div key={appointment._id} className="upcoming-item"   onClick={() => handleViewAppointment(appointment)}
                    style={{ cursor: 'pointer' }}>
                      <div className="upcoming-header">
                        <span className="upcoming-time">{appointment.date.split('T')[0]} à {appointment.time}</span>
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status === 'confirmed' ? 'confirmé' : 'en attente'}
                        </span>
                      </div>
                      <div className="upcoming-details">
                        <h3 className="upcoming-patient">{appointment.patient?.firstName || 'Patient'} {appointment.patient?.lastName}</h3>
                        <p className="upcoming-type">{appointment.type || 'Consultation générale'}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-appointments">Aucun rendez-vous à venir</div>
              )}
            </div>
            <div className="card-footer">
              <a href="./Rendez-vous" className="card-link">Voir tous les rendez-vous →</a>
            </div>
          </div>
          
          {/* Statistiques mensuelles */}
          <div className="card wide-card">
            <div className="card-header">
              <h2 className="card-title">Rendez-vous mensuels</h2>
              <div className="card-subtitle">12 derniers mois</div>
            </div>
            <div className="chart-container">
              {appointmentsLoading ? (
                <div className="loading-indicator">Chargement des données...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAppointmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} rendez-vous`, 'Nombre']}
                      labelFormatter={(label) => `Mois: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#0A192F" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#0A192F" }}
                      activeDot={{ r: 6, fill: "#0A192F" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Bell size={20} className="card-title-icon" />
                Notifications
              </h2>
              <span className="badge red">{unreadCount} nouvelles</span>
            </div>
            <div className="notification-list">
              {notificationsLoading ? (
                <div className="loading-indicator">Chargement des notifications...</div>
              ) : (
                <>
                  {unreadMessageNotifications.length > 0 && (
                    <div className="notification-item message">
                      <MessageSquare size={18} className="notification-icon" />
                      <div className="notification-content">
                        <p className="notification-title">Vous avez {unreadMessageNotifications.length} notifications non vues</p>
                        
                      </div>
                    </div>
                  )}
                  {unreadAppointmentNotifications.length > 0 && (
                    <div className="notification-item approval">
                      <CheckCircle size={18} className="notification-icon" />
                      <div className="notification-content">
                        <p className="notification-title">{unreadAppointmentNotifications.length} rendez-vous en attente</p>
                        <p className="notification-subtitle">Nécessitent votre approbation</p>
                      </div>
                    </div>
                  )}
                  {pendingAppointmentsCount > 0 && !unreadAppointmentNotifications.length && (
                    <div className="notification-item approval">
                      <CheckCircle size={18} className="notification-icon" />
                      <div className="notification-content">
                        <p className="notification-title">{pendingAppointmentsCount} rendez-vous en attente de confirmation</p>
                        <p className="notification-subtitle">Nécessitent votre approbation</p>
                      </div>
                    </div>
                  )}
                  {unreadCount === 0 && (
                    <div className="notification-item">
                      <Bell size={18} className="notification-icon" />
                      <div className="notification-content">
                        <p className="notification-title">Aucune nouvelle notification</p>
                        <p className="notification-subtitle">Vous êtes à jour</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
          </div>
          
          {/* Démographie des patients */}
          <div className="card wide-card">
            <div className="card-header">
              <h2 className="card-title">Démographie des patients</h2>
              <div className="card-subtitle">Répartition par âge</div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patientDemographicsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="ageGroup" 
                    axisLine={false} 
                    tickLine={false} 
                    label={{ value: 'Tranches d\'âge', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    label={{ value: 'Nombre de patients', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} patients`, 'Nombre']}
                    labelFormatter={(label) => `Âge: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#0A192F"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>

      {/* Modal de rendez-vous */}
      <GlobalAppointmentModal
        patients={list || []}
        open={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        onAppointmentAdded={handleAppointmentAdded}
      />

      {/* Modal d'article */}
      <CreateArticleModal
        open={isArticleModalOpen}
        onClose={handleCloseArticleModal}
        onArticleAdded={handleArticleAdded}
      />
    </div>
  );
};

export default Acceuil;
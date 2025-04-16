import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, RefreshCw, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getDoctorAppointments } from '../Redux/slices/appointmentSlice';
import { addPrivateEngagement, updatePrivateEngagement, fetchPrivateEngagements, deletePrivateEngagement } from '../Redux/slices/engagementSlice';

const Agenda = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [engagementForm, setEngagementForm] = useState({
    id: null,
    description: '',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get appointments and engagements from Redux store
  const { appointments, loading, error } = useSelector(state => state.appointments);
  const { engagements = [], status } = useSelector(state => state.privateEngagements || {});
  const engagementsLoading = status === 'loading';
  
  
  // Filter appointments to show only confirmed and completed status
  const filteredAppointments = appointments ? appointments.filter(appointment => 
    appointment.status === "confirmed" || appointment.status === "completed"
  ) : [];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [engagementToDelete, setEngagementToDelete] = useState(null);
  // Filter engagements to show only those for the selected date in day view
  const getDayEngagements = (date) => {
    if (!engagements || !engagements.length) return [];
    
    const dateToCheck = typeof date === 'string' ? date : formatDateToString(date);
    
    return engagements.filter(eng => {
      const engDate = new Date(eng.startDate);
      const engDateStr = formatDateToString(engDate);
      return engDateStr === dateToCheck;
    });
  };

  // Fetch appointments and engagements when component mounts
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      dispatch(getDoctorAppointments()),
      dispatch(fetchPrivateEngagements())
    ])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  // Refresh appointments and engagements
  const handleRefresh = () => {
    setIsLoading(true);
    Promise.all([
      dispatch(getDoctorAppointments()),
      dispatch(fetchPrivateEngagements())
    ])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  };

  const handleOpenEngagementModal = (date = null) => {
    let defaultStart;
  
    // Vérifie si date est une chaîne valide ou un objet Date
    if (date && !isNaN(new Date(date))) {
      defaultStart = new Date(date);
    } else {
      defaultStart = new Date();
    }
  
    defaultStart.setHours(8, 0, 0, 0);
  
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setHours(9, 0, 0, 0);
  
    const formatForDateTimeLocal = (dateObj) => {
      const pad = (num) => num.toString().padStart(2, '0');
      return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    };
  
    setEngagementForm({
      id: null,
      description: '',
      startDate: formatForDateTimeLocal(defaultStart),
      endDate: formatForDateTimeLocal(defaultEnd)
    });
  
    setShowEngagementModal(true);
  };
  
// Open engagement modal for editing existing engagement
const handleEditEngagement = (engagement) => {
  // Helper function to convert ISO string to datetime-local format
  const toDateTimeLocal = (isoString) => {
    const date = new Date(isoString);
    const pad = (num) => num.toString().padStart(2, '0');
    
    // Get local date components
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  setEngagementForm({
    id: engagement._id,
    description: engagement.description,
    startDate: toDateTimeLocal(engagement.startDate),
    endDate: toDateTimeLocal(engagement.endDate)
  });
  setShowEngagementModal(true);
};

  // Close engagement modal
  const handleCloseEngagementModal = () => {
    setShowEngagementModal(false);
    setEngagementForm({
      id: null,
      description: '',
      startDate: '',
      endDate: ''
    });
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEngagementForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const now = new Date();
    const startDate = new Date(engagementForm.startDate);
    const endDate = new Date(engagementForm.endDate);

    if (!engagementForm.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!engagementForm.startDate) {
      errors.startDate = 'Start date is required';
    } else if (startDate < now) {
      errors.startDate = 'Start date cannot be in the past';
    }

    if (!engagementForm.endDate) {
      errors.endDate = 'End date is required';
    } else if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for both add and update
  const handleSubmitEngagement = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      // Format dates properly before sending
      const formattedData = {
        ...engagementForm,
        startDate: new Date(engagementForm.startDate).toISOString(),
        endDate: new Date(engagementForm.endDate).toISOString()
      };
  
      if (engagementForm.id) {
        await dispatch(updatePrivateEngagement(formattedData)).unwrap();
      } else {
        await dispatch(addPrivateEngagement(formattedData)).unwrap();
      }
      
      handleCloseEngagementModal();
      handleRefresh();
    } catch (error) {
      console.error('Error saving engagement:', error);
      setFormErrors({
        submit: error.message || 'Failed to save engagement. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete engagement
  const handleDeleteEngagement = async (id) => {
    setEngagementToDelete(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      await dispatch(deletePrivateEngagement(engagementToDelete)).unwrap();
      handleRefresh();
    } catch (error) {
      console.error('Error deleting engagement:', error);
      // You can show a toast notification here instead of alert
    } finally {
      setShowDeleteModal(false);
      setEngagementToDelete(null);
    }
  };

  // Format date as YYYY-MM-DD
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to normalize dates for comparison
  const areDatesEqual = (date1, date2) => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return formatDateToString(date);
    };
    
    if (!date1 || !date2) return false;
    
    const formattedDate1 = typeof date1 === 'string' ? formatDate(date1) : formatDateToString(date1);
    const formattedDate2 = typeof date2 === 'string' ? formatDate(date2) : formatDateToString(date2);
    
    return formattedDate1 === formattedDate2;
  };

  // Get appointments for a specific day
  const getDayAppointments = (date) => {
    if (!filteredAppointments || !filteredAppointments.length) return [];
    
    const dateToCheck = typeof date === 'string' ? date : formatDateToString(date);
    
    return filteredAppointments.filter(app => {
      const appDate = new Date(app.date);
      const appDateStr = formatDateToString(appDate);
      return appDateStr === dateToCheck;
    });
  };

  // Parse appointment time and calculate end time (20 min duration)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 20;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  // Check if a date has appointments or engagements
  const hasAppointmentsOrEngagements = (date) => {
    if (!filteredAppointments && !engagements) return false;
    
    const hasAppts = filteredAppointments?.some(app => {
      const appDate = new Date(app.date);
      return areDatesEqual(appDate, date);
    });
    
    const hasEngs = engagements?.some(eng => {
      const engDate = new Date(eng.startDate);
      return areDatesEqual(engDate, date);
    });
    
    return hasAppts || hasEngs;
  };

  // Generate calendar data
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const weeks = [];
    let days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0);
      const day = new Date(year, month - 1, prevMonthLastDay.getDate() - firstDayOfWeek + i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
      
      if ((days.length % 7 === 0) || i === daysInMonth) {
        weeks.push(days);
        days = [];
      }
    }
    
    if (days.length > 0) {
      const daysToAdd = 7 - days.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const day = new Date(year, month + 1, i);
        days.push({ date: day, isCurrentMonth: false });
      }
      weeks.push(days);
    }
    
    return weeks;
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const selectDay = (day) => {
    setSelectedDate(day.date);
    setView('day');
  };
  
  const backToMonth = () => {
    setView('month');
  };

  // Get month and year display
  const monthYearDisplay = currentDate.toLocaleDateString('fr-TN', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Day view time slots generation
  const generateTimeSlots = () => {
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
    return hours.flatMap(hour => 
      ['00', '20', '40'].map(minute => `${hour.toString().padStart(2, '0')}:${minute}`)
    );
  };

  const timeSlots = generateTimeSlots();
  
  // Calculate appointment position from start time
  const calculateAppointmentTop = (start) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const dayStart = 8 * 60;
    
    const minutesFromDayStart = startTime - dayStart;
    return (minutesFromDayStart / 20) * 40;
  };

  // Calculate appointment height from duration
  const calculateAppointmentHeight = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    const duration = endTime - startTime;
    return (duration / 20) * 40;
  };

  // Format selected date for display
  const formatSelectedDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-TN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Get count of appointments and engagements for a day
  const getAppointmentCount = (date) => {
    const appointmentsCount = getDayAppointments(date).length;
    const engagementsCount = getDayEngagements(date).length;
    return appointmentsCount + engagementsCount;
  };

  // Helper function to get patient name
  const getPatientName = (patient) => {
    if (!patient) return "Patient non spécifié";
    
    if (typeof patient === 'object') {
      return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    
    return patient.toString();
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "Sélectionnez les dates";
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate - startDate;
      
      if (diffMs <= 0) return "Durée invalide";
      
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      }
      return `${minutes}min`;
    } catch (e) {
      return "Durée invalide";
    }
  };

  // CSS-in-JS Styles
  const styles = {
    deleteModalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    deleteModal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      width: '400px',
      maxWidth: '90%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    deleteModalTitle: {
      margin: '0 0 16px 0',
      fontSize: '20px',
      color: '#333',
    },
    deleteModalText: {
      margin: '0 0 24px 0',
      fontSize: '16px',
      color: '#666',
    },
    deleteModalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    deleteModalCancel: {
      padding: '10px 16px',
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#e0e0e0',
      },
    },
    deleteModalConfirm: {
      padding: '10px 16px',
      backgroundColor: '#ff4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#cc0000',
      },
    },
    container: {
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    header: {
      background: 'linear-gradient(to right, #0A192F, #112240)',
      color: 'white',
      padding: '16px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    headerText: {
      fontSize: '20px',
      fontWeight: 600,
      margin: 0
    },
    navContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    navButton: {
      background: '#0A192F',
      border: '1px solid white',
      color: 'white',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease, transform 0.2s',
      ':hover': {
        backgroundColor: '#1c2e50',
        transform: 'scale(1.1)'
      }
    },
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: '1px solid white',
      color: 'white',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '50%',
      marginRight: '8px',
      transition: 'background-color 0.2s ease, transform 0.2s',
    },
    engagementButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: '1px solid white',
      color: 'white',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '50%',
      marginRight: '8px',
      transition: 'background-color 0.2s ease, transform 0.2s',
      ':hover': {
        backgroundColor: '#1c2e50',
        transform: 'scale(1.1)'
      }
    },
    monthTitle: {
      fontWeight: 500,
      fontSize: '18px',
      textTransform: 'capitalize'
    },
    todayButton: {
      marginLeft: '16px',
      padding: '6px 12px',
      backgroundColor: 'white',
      color: '#0A192F',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#f8f8f8'
      }
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      backgroundColor: 'white',
      color: '#0A192F',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#f8f8f8'
      }
    },
    content: {
      maxWidth: '1200px',
      margin: '24px auto',
      padding: '0 16px'
    },
    calendarContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    },
    weekdaysHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      borderBottom: '1px solid #e0e0e0'
    },
    weekdayCell: {
      padding: '16px',
      textAlign: 'center',
      fontWeight: 500,
      color: '#666'
    },
    monthGrid: {
      borderTop: '1px solid #e0e0e0'
    },
    weekRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      borderBottom: '1px solid #e0e0e0',
      ':last-child': {
        borderBottom: 'none'
      }
    },
    dayCell: {
      minHeight: '100px',
      padding: '8px',
      position: 'relative',
      borderRight: '1px solid #e0e0e0',
      cursor: 'pointer',
      ':last-child': {
        borderRight: 'none'
      }
    },
    dayCellInactive: {
      backgroundColor: '#f5f5f5',
      color: '#aaa'
    },
    dayCellToday: {
      backgroundColor: '#e6f0ff'
    },
    dayCellSelected: {
      boxShadow: 'inset 0 0 0 2px #2563eb',
      zIndex: 1
    },
    dayNumber: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 4px auto',
      borderRadius: '50%'
    },
    dayNumberToday: {
      backgroundColor: '#0A192F',
      color: 'white'
    },
    appointmentIndicator: {
      marginTop: '4px',
      backgroundColor: '#e6f0ff',
      color: '#0A192F',
      padding: '4px',
      borderRadius: '4px',
      fontSize: '12px',
      textAlign: 'center'
    },
    dayViewHeader: {
      padding: '16px',
      borderBottom: '1px solid #e0e0e0'
    },
    dayViewTitle: {
      fontSize: '20px',
      fontWeight: 600,
      margin: 0,
      textTransform: 'capitalize'
    },
    dayViewContent: {
      display: 'flex'
    },
    timeColumn: {
      width: '80px',
      flexShrink: 0,
      backgroundColor: '#f5f5f5',
      borderRight: '1px solid #e0e0e0'
    },
    timeSlot: {
      height: '40px',
      paddingRight: '8px',
      textAlign: 'right',
      fontSize: '14px',
      color: '#666'
    },
    timeSlotHour: {
      borderTop: '1px solid #e0e0e0',
      fontWeight: 500
    },
    appointmentsColumn: {
      flexGrow: 1,
      position: 'relative'
    },
    appointmentSlot: {
      height: '40px',
      borderTop: '1px solid #f0f0f0'
    },
    appointmentItem: {
      position: 'absolute',
      left: '4px',
      right: '4px',
      background: 'linear-gradient(to right, #0A192F, #112240)',
      color: 'white',
      borderRadius: '4px',
      padding: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    engagementItem: {
      position: 'absolute',
      left: '4px',
      right: '4px',
      background: 'linear-gradient(to right, #4a044e, #6b056b)',
      color: 'white',
      borderRadius: '4px',
      padding: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    appointmentPatient: {
      fontWeight: 500,
      fontSize: '14px'
    },
    appointmentType: {
      fontSize: '13px',
      color: '#b8c7e0'
    },
    engagementType: {
      fontSize: '13px',
      color: '#e0b8e0'
    },
    appointmentTime: {
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginLeft: 'auto'
    },
    editButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      cursor: 'pointer',
      padding: '2px 6px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
      }
    },
    deleteButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      cursor: 'pointer',
      padding: '2px 6px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: 'rgba(255, 0, 0, 0.3)'
      }
    },
    noAppointments: {
      padding: '48px 0',
      textAlign: 'center',
      color: '#666'
    },
    loadingContainer: {
      padding: '48px 0',
      textAlign: 'center',
      color: '#666',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
    errorMessage: {
      padding: '16px',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      borderRadius: '4px',
      margin: '16px 0',
      textAlign: 'center'
    },
    statusIndicator: {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '4px'
    },
    confirmedStatus: {
      backgroundColor: '#10B981'
    },
    completedStatus: {
      backgroundColor: '#6366F1'
    },
    privateEngagementStatus: {
      backgroundColor: '#A855F7'
    },
    engagementItem: {
      position: 'absolute',
      left: '4px',
      right: '4px',
      backgroundColor: '#f0f7ff',
      border: '1px solid #c2dfff',
      borderRadius: '4px',
      padding: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: '#e0f0ff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    },
    engagementContent: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    engagementDescription: {
      fontWeight: '500',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    engagementTime: {
      fontSize: '12px',
      color: '#4a6b9b',
      marginTop: 'auto'
    },
    deleteEngagementButton: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      background: 'none',
      border: 'none',
      color: '#a0b4d0',
      cursor: 'pointer',
      padding: '2px',
      borderRadius: '4px',
      ':hover': {
        color: '#ff6b6b'
      }
    },
    addEngagementButton: {
      padding: '6px 12px',
      backgroundColor: '#f0f7ff',
      color: '#1e88e5',
      border: '1px solid #c2dfff',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      marginLeft: 'auto',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: '#e0f0ff'
      }
    }
  };

  if (loading || isLoading || engagementsLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerTitle}>
              <Calendar size={24} />
              <h1 style={styles.headerText}>Agenda Médical</h1>
            </div>
          </div>
        </div>
        
        <div style={styles.loadingContainer}>
          <RefreshCw size={40} style={{
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
          <p>Chargement des rendez-vous et engagements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerTitle}>
              <Calendar size={24} />
              <h1 style={styles.headerText}>Agenda Médical</h1>
            </div>
            <button onClick={handleRefresh} style={styles.todayButton}>
              Réessayer
            </button>
          </div>
        </div>
        
        <div style={styles.content}>
          <div style={styles.errorMessage}>
            Une erreur est survenue lors du chargement des rendez-vous. Veuillez réessayer.
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div style={styles.container}>
      {/* Engagement Modal */}
      {showDeleteModal && (
  <div style={styles.deleteModalOverlay}>
    <div style={styles.deleteModal}>
      <h3 style={styles.deleteModalTitle}>Confirmer la suppression</h3>
      <p style={styles.deleteModalText}>Êtes-vous sûr de vouloir supprimer cet engagement ?</p>
      <div style={styles.deleteModalButtons}>
        <button 
          onClick={() => setShowDeleteModal(false)}
          style={styles.deleteModalCancel}
        >
          Annuler
        </button>
        <button 
          onClick={confirmDelete}
          style={styles.deleteModalConfirm}
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
      {showEngagementModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '580px',
            maxWidth: '95%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(to right, #0A192F, #112240)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                margin: 0,
                color: 'white',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                {engagementForm.id ? 'Modifier' : 'Ajouter'} un engagement privé
              </h2>
              <button 
                onClick={handleCloseEngagementModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {formErrors.submit && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {formErrors.submit}
                </div>
              )}

              <form onSubmit={handleSubmitEngagement}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#334155',
                    fontSize: '14px'
                  }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={engagementForm.description}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s',
                      ':focus': {
                        outline: 'none',
                        borderColor: '#0A192F',
                        boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.1)'
                      }
                    }}
                    placeholder="Décrivez la raison de cet engagement..."
                  />
                  {formErrors.description && (
                    <div style={{
                      color: '#dc2626',
                      fontSize: '12px',
                      marginTop: '4px'
                    }}>
                      {formErrors.description}
                    </div>
                  )}
                </div>

                {/* Enhanced Date/Time Selection */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Start Date/Time */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#334155',
                      fontSize: '14px'
                    }}>
                      Début
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="date"
                          value={engagementForm.startDate.split('T')[0] || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = engagementForm.startDate.includes('T') ? 
                              engagementForm.startDate.split('T')[1] : '08:00';
                            setEngagementForm(prev => ({
                              ...prev,
                              startDate: `${date}T${time}`
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            ':focus': {
                              outline: 'none',
                              borderColor: '#0A192F',
                              boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.1)'
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select
                          value={engagementForm.startDate.includes('T') ? 
                            engagementForm.startDate.split('T')[1] : '08:00'}
                          onChange={(e) => {
                            const time = e.target.value;
                            const date = engagementForm.startDate.includes('T') ? 
                              engagementForm.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                            setEngagementForm(prev => ({
                              ...prev,
                              startDate: `${date}T${time}`
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            ':focus': {
                              outline: 'none',
                              borderColor: '#0A192F',
                              boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.1)'
                            }
                          }}
                        >
                          {Array.from({ length: 13 }, (_, i) => {
                            const hour = 8 + i;
                            return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`];
                          }).flat().map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formErrors.startDate && (
                      <div style={{
                        color: '#dc2626',
                        fontSize: '12px',
                        marginTop: '4px'
                      }}>
                        {formErrors.startDate}
                      </div>
                    )}
                  </div>

                  {/* End Date/Time */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#334155',
                      fontSize: '14px'
                    }}>
                      Fin
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="date"
                          value={engagementForm.endDate.split('T')[0] || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = engagementForm.endDate.includes('T') ? 
                              engagementForm.endDate.split('T')[1] : '09:00';
                            setEngagementForm(prev => ({
                              ...prev,
                              endDate: `${date}T${time}`
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            ':focus': {
                              outline: 'none',
                              borderColor: '#0A192F',
                              boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.1)'
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select
                          value={engagementForm.endDate.includes('T') ? 
                            engagementForm.endDate.split('T')[1] : '09:00'}
                          onChange={(e) => {
                            const time = e.target.value;
                            const date = engagementForm.endDate.includes('T') ? 
                              engagementForm.endDate.split('T')[0] : new Date().toISOString().split('T')[0];
                            setEngagementForm(prev => ({
                              ...prev,
                              endDate: `${date}T${time}`
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                      ':focus': {
                        outline: 'none',
                        borderColor: '#0A192F',
                        boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.1)'
                      }
                    }}
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = 8 + i;
                      return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`];
                    }).flat().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formErrors.endDate && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  {formErrors.endDate}
                </div>
              )}
            </div>
          </div>

          {/* Duration Info */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#64748b" />
              <span>Durée: {calculateDuration(engagementForm.startDate, engagementForm.endDate)}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={handleCloseEngagementModal}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1'
                }
              }}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              style={{
                padding: '10px 16px',
                backgroundColor: '#0A192F',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#112240'
                },
                ':disabled': {
                  backgroundColor: '#cbd5e1',
                  cursor: 'not-allowed'
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} style={{ 
                    marginRight: '8px',
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }} />
                  Enregistrement...
                </>
              ) : 'Ajouter l\'engagement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
      
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTitle}>
            <Calendar size={24} />
            <h1 style={styles.headerText}>Agenda Médical</h1>
          </div>
          
          <div style={styles.navContainer}>
            {view === 'month' ? (
              <>
                <button 
                  onClick={handleRefresh} 
                  style={styles.refreshButton}
                  title="Rafraîchir les rendez-vous"
                >
                  <RefreshCw size={18} />
                </button>
                
                <button 
                  onClick={handleOpenEngagementModal}
                  style={styles.engagementButton}
                  title="Ajouter un engagement"
                >
                  <Plus size={18} />
                </button>
                
                <button 
                  onClick={prevMonth}
                  style={styles.navButton}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span style={styles.monthTitle}>{monthYearDisplay}</span>
                
                <button 
                  onClick={nextMonth}
                  style={styles.navButton}
                >
                  <ChevronRight size={20} />
                </button>
                
                <button 
                  onClick={goToToday}
                  style={styles.todayButton}
                >
                  Aujourd'hui
                </button>
              </>
            ) : (
              <button 
                onClick={backToMonth}
                style={styles.backButton}
              >
                <ChevronLeft size={16} />
                Retour au calendrier
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Month View */}
        {view === 'month' && (
          <div style={styles.calendarContainer}>
            {/* Days of week header */}
            <div style={styles.weekdaysHeader}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} style={styles.weekdayCell}>{day}</div>
              ))}
            </div>
            
            {/* Calendar days */}
<div style={styles.monthGrid}>
  {generateCalendarDays().map((week, weekIndex) => (
    <div key={weekIndex} style={styles.weekRow}>
      {week.map((day, dayIndex) => {
        const hasAppointment = hasAppointmentsOrEngagements(day.date);
        const isTodayDate = isToday(day.date);
        const isSelectedDay = selectedDate && 
          day.date.getDate() === selectedDate.getDate() && 
          day.date.getMonth() === selectedDate.getMonth() && 
          day.date.getFullYear() === selectedDate.getFullYear();
        
        const dayCellStyle = {
          ...styles.dayCell,
          ...(day.isCurrentMonth ? {} : styles.dayCellInactive),
          ...(isTodayDate ? styles.dayCellToday : {}),
          ...(isSelectedDay ? styles.dayCellSelected : {})
        };
        
        const dayNumberStyle = {
          ...styles.dayNumber,
          ...(isTodayDate ? styles.dayNumberToday : {})
        };

        // Get counts for appointments and engagements
        const appointmentsCount = getDayAppointments(day.date).length;
        const engagementsCount = getDayEngagements(day.date).length;
        
        return (
          <div 
            key={dayIndex} 
            style={dayCellStyle}
            onClick={() => selectDay(day)}
          >
            <div style={dayNumberStyle}>
              {day.date.getDate()}
            </div>
            
            {(appointmentsCount > 0 || engagementsCount > 0) && (
              <div style={styles.appointmentIndicator}>
                {appointmentsCount > 0 && (
                  <span>{appointmentsCount} {appointmentsCount === 1 ? 'rendez-vous' : 'rendez-vous'}</span>
                )}
                {engagementsCount > 0 && (
                  <span style={{ marginLeft: appointmentsCount > 0 ? '4px' : 0 }}>
                    {engagementsCount} {engagementsCount === 1 ? 'engagement' : 'engagements'}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  ))}
</div>
          </div>
        )}
        
       {/* Day View */}
{view === 'day' && selectedDate && (
  <div style={styles.calendarContainer}>
    <div style={styles.dayViewHeader}>
      <h2 style={styles.dayViewTitle}>{formatSelectedDate(selectedDate)}</h2>
      <button 
        onClick={() => handleOpenEngagementModal(selectedDate)}
        style={styles.addEngagementButton}
      >
        <Plus size={14} style={{ marginRight: 6 }} />
        Ajouter un engagement
      </button>
    </div>
    
    <div style={styles.dayViewContent}>
      {/* Time column */}
      <div style={styles.timeColumn}>
        {timeSlots.map((timeSlot, index) => {
          const isHourStart = timeSlot.endsWith('00');
          const timeSlotStyle = {
            ...styles.timeSlot,
            ...(isHourStart ? styles.timeSlotHour : {})
          };
          
          return (
            <div key={index} style={timeSlotStyle}>
              {isHourStart ? timeSlot : ''}
            </div>
          );
        })}
      </div>
      
      {/* Appointments column */}
      <div style={styles.appointmentsColumn}>
        {timeSlots.map((timeSlot, index) => {
          const isHourStart = timeSlot.endsWith('00');
          const timeSlotStyle = {
            ...styles.appointmentSlot,
            ...(isHourStart ? { borderTopColor: '#e0e0e0' } : {})
          };
          
          return <div key={index} style={timeSlotStyle}></div>;
        })}
        
        {/* Render appointments */}
        {getDayAppointments(selectedDate).map((appointment, index) => {
          const endTime = appointment.end || calculateEndTime(appointment.time || appointment.start);
          const startTime = appointment.time || appointment.start;
          const top = calculateAppointmentTop(startTime);
          const patientName = getPatientName(appointment.patient);
          
          const appointmentStyle = {
            ...styles.appointmentItem,
            top: `${top}px`,
            height: '40px',
          };
          
          // Style based on status
          const statusStyle = {
            ...styles.statusIndicator,
            ...(appointment.status === "confirmed" ? styles.confirmedStatus : {}),
            ...(appointment.status === "completed" ? styles.completedStatus : {})
          };
          
          return (
            <div key={index} style={appointmentStyle}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={statusStyle}></span>
                  <span style={styles.appointmentPatient}>{patientName}</span>
                  <span style={{
                    fontSize: '12px',
                    marginLeft: '6px',
                    color: '#b8c7e0',
                  }}>
                    <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle'}} />
                    {startTime} - {endTime}
                  </span>
                </div>
                <div style={{
                  ...styles.appointmentType,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px'
                }}>
                  {appointment.type}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Render engagements */}
        {getDayEngagements(selectedDate).map((engagement, index) => {
          const startTime = new Date(engagement.startDate).toTimeString().substring(0, 5);
          const endTime = new Date(engagement.endDate).toTimeString().substring(0, 5);
          const top = calculateAppointmentTop(startTime);
          const height = calculateAppointmentHeight(startTime, endTime);
          
          return (
            <div 
              key={`eng-${index}`} 
              style={{
                ...styles.engagementItem,
                top: `${top}px`,
                height: `${height}px`,
              }}
              onClick={() => handleEditEngagement(engagement)}
            >
              <div style={styles.engagementContent}>
                <div style={styles.engagementDescription}>
                  {engagement.description}
                </div>
                <div style={styles.engagementTime}>
                  {startTime} - {endTime}
                </div>
              </div>
              <button 
              onClick={(e) => {
                e.stopPropagation();
                setEngagementToDelete(engagement._id);
                setShowDeleteModal(true);
              }}
              style={styles.deleteEngagementButton}
            >
              <Trash2 size={14} />
            </button>
            </div>
          );
        })}
      </div>
    </div>
    
    {/* No appointments or engagements message */}
    {getDayAppointments(selectedDate).length === 0 && 
     getDayEngagements(selectedDate).length === 0 && (
      <div style={styles.noAppointments}>
        Aucun rendez-vous ou engagement pour cette journée.
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
}
export default Agenda;
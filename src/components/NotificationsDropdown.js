import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, Dropdown, List, Avatar, Button, Empty, Spin, Typography, message, Tag } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  MessageOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotificationAsync, 
  addNotification, 
  markAsRead 
} from '../Redux/slices/notificationSlice';
import { getSocket } from '../services/socketService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Add relative time support for dayjs
dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// Create a sound for notifications
const createNotificationSound = () => {
  // Use a short, base64-encoded sound that's less likely to be blocked
  const soundBase64 = "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFzb25pY1N0dWRpb3MuY29tIA==";
  const audio = new Audio(soundBase64);
  audio.volume = 0.5;
  return audio;
};

// Create a new audio instance for each notification rather than reusing
const playNotificationSound = () => {
  console.log('Attempting to play notification sound');
  const audio = createNotificationSound();
  
  try {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Notification sound played successfully');
        })
        .catch(error => {
          console.error('Failed to play notification sound:', error);
          
          // Fallback to Web Audio API if audio playback fails
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          } catch (fallbackError) {
            console.error('Fallback sound also failed:', fallbackError);
          }
        });
    }
  } catch (error) {
    console.error('Error initializing notification sound:', error);
  }
};

// Custom toast notification component
const NotificationToast = ({ notification, onClose, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08)',
        borderRadius: '4px',
        display: 'flex',
        width: '100%',
        cursor: 'pointer',
        borderLeft: '4px solid #1890ff'
      }}
    >
      <div style={{ marginRight: '12px' }}>
        <Avatar 
          icon={
            notification.type === 'message' ? <MessageOutlined /> : 
            notification.type === 'appointment' ? <CalendarOutlined /> : 
            notification.type === 'medical' ? <FileTextOutlined /> : 
            <BellOutlined />
          } 
          style={{ 
            backgroundColor: '#e6f7ff',
            color: '#1890ff'
          }} 
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '4px'
        }}>
          <Text strong>{notification.title}</Text>
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{ marginRight: '-8px', marginTop: '-4px' }}
          />
        </div>
        <Text>{notification.content}</Text>
      </div>
    </div>
  );
};

// Toast container to render notification toasts
const createToastContainer = () => {
  if (!document.getElementById('custom-toast-container')) {
    const container = document.createElement('div');
    container.id = 'custom-toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '1010';
    container.style.display = 'flex';
    container.style.flexDirection = 'column-reverse';
    container.style.maxHeight = '100vh';
    container.style.overflowY = 'auto';
    container.style.pointerEvents = 'none';
    
    document.body.appendChild(container);
    console.log('Toast container created');
  }
  
  return document.getElementById('custom-toast-container');
};

// Create HTML for a notification toast (used as fallback)
const createToastHTML = (notification) => {
  // Create icon HTML based on notification type
  let iconHTML = '';
  
  switch (notification.type) {
    case 'message':
      iconHTML = '<span style="font-size: 20px; color: #1890ff;">💬</span>';
      break;
    case 'appointment':
      iconHTML = '<span style="font-size: 20px; color: #52c41a;">📅</span>';
      break;
    case 'medical':
      iconHTML = '<span style="font-size: 20px; color: #fa8c16;">📄</span>';
      break;
    default:
      iconHTML = '<span style="font-size: 20px; color: #722ed1;">🔔</span>';
  }
  
  return `
    <div style="padding: 12px; background-color: #fff; box-shadow: 0 3px 6px rgba(0,0,0,0.16); border-radius: 4px; border-left: 4px solid #1890ff; display: flex; pointer-events: auto; cursor: pointer;">
      <div style="margin-right: 12px; width: 32px; height: 32px; border-radius: 50%; background-color: #e6f7ff; display: flex; align-items: center; justify-content: center;">
        ${iconHTML}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <div style="font-weight: bold;">${notification.title}</div>
          <button onclick="this.parentNode.parentNode.parentNode.parentNode.remove()" style="background: none; border: none; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        <div>${notification.content}</div>
      </div>
    </div>
  `;
};

const NotificationsDropdown = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector(state => state.notifications);
  const accessToken = useSelector(state => state.auth.accessToken);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [toastContainer, setToastContainer] = useState(null);
      const { appointments } = useSelector(state => state.appointments); // Get appointments from Redux

  // Initialize toast container
  useEffect(() => {
    const container = createToastContainer();
    setToastContainer(container);
    
    // Clean up function
    return () => {
      // We don't remove the container on unmount
    };
  }, []);

  // Define handleNotificationClick before useEffect to avoid reference errors
  const handleNotificationClick = useCallback((notification) => {
    console.log('Notification clicked:', notification);
    
    if (!notification.isRead) {
      // Mark as read in both local state and backend
      const notificationId = notification.notificationId || notification._id;
      dispatch(markNotificationAsRead(notificationId));
    }

    switch (notification.type) {
      case 'message':
        if (notification.relatedEntity) {
          navigate(`/dashboard/Chats/${notification.relatedEntity}`);
        }
        break;
      case 'appointment':
        if (notification.relatedEntity) {
          // Find the appointment in the existing list
          const appointment = appointments.find(apt => apt._id === notification.relatedEntity);
          
          if (appointment) {
            // If appointment is found, navigate with it
            navigate(`/dashboard/Patients/${notification.sender}/appointments`, { 
              state: { appointment } 
            });
          } else {
            // If appointment is not in the list, navigate with just the ID
            console.log('Appointment not found in current list, navigating with ID only');
            navigate(`/dashboard/Patients/${notification.sender}/appointments`, { 
              state: { appointmentId: notification.relatedEntity } 
            });
          }
        }
        break;
      case 'medical':
        if (notification.relatedEntity) {
          navigate(`/medical-records/${notification.relatedEntity}`);
        }
        break;
      default:
        break;
    }
    
    setOpen(false); // Close dropdown after clicking
  }, [dispatch, navigate]);

  // Get the appropriate icon for a notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': 
        return <MessageOutlined style={{ color: '#1890ff' }} />;
      case 'appointment': 
        return <CalendarOutlined style={{ color: '#52c41a' }} />;
      case 'medical': 
        return <FileTextOutlined style={{ color: '#fa8c16' }} />;
      default: 
        return <BellOutlined style={{ color: '#722ed1' }} />;
    }
  };

  // Show custom toast notification
  const showToast = useCallback((notification) => {
    console.log('Attempting to show toast for notification:', notification);
    
    if (!toastContainer) {
      console.error('Toast container not found');
      return;
    }
    
    const toastId = `toast-${Date.now()}`;
    
    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.style.marginTop = '16px';
    toastElement.style.pointerEvents = 'auto'; // Make toast clickable
    toastElement.style.width = '320px';
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateX(50px)';
    toastElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Add to container
    toastContainer.appendChild(toastElement);
    
    // Function to remove toast
    const removeToast = () => {
      if (toastElement && toastContainer.contains(toastElement)) {
        toastElement.style.opacity = '0';
        toastElement.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
          if (toastElement && toastContainer.contains(toastElement)) {
            toastContainer.removeChild(toastElement);
            setToasts(prev => prev.filter(t => t !== toastId));
          }
        }, 300);
      }
    };
    
    // Render toast using modern React
    try {
      // For React 18+
      if (window.ReactDOM && window.ReactDOM.createRoot) {
        console.log('Using ReactDOM.createRoot to render toast');
        const root = window.ReactDOM.createRoot(toastElement);
        root.render(
          <NotificationToast 
            notification={notification}
            onClose={removeToast}
            onClick={() => {
              handleNotificationClick(notification);
              removeToast();
            }}
          />
        );
      } 
      // Fallback for React 17
      else if (window.ReactDOM && window.ReactDOM.render) {
        console.log('Using ReactDOM.render to render toast');
        window.ReactDOM.render(
          <NotificationToast 
            notification={notification}
            onClose={removeToast}
            onClick={() => {
              handleNotificationClick(notification);
              removeToast();
            }}
          />,
          toastElement
        );
      }
      // Fallback to HTML
      else {
        console.log('Using HTML fallback for toast');
        toastElement.innerHTML = createToastHTML(notification);
        toastElement.onclick = () => {
          handleNotificationClick(notification);
          removeToast();
        };
      }
    } catch (error) {
      console.error("Error rendering toast:", error);
      // Fallback to simple HTML
      toastElement.innerHTML = createToastHTML(notification);
      toastElement.onclick = () => {
        handleNotificationClick(notification);
        removeToast();
      };
    }
    
    // Animate in
    setTimeout(() => {
      toastElement.style.opacity = '1';
      toastElement.style.transform = 'translateX(0)';
    }, 50);
    
    // Auto dismiss after 5 seconds
    setTimeout(removeToast, 5000);
    
    // Add to state
    setToasts(prev => [...prev, toastId]);
  }, [toastContainer, handleNotificationClick]);

  // Load initial notifications
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, accessToken]);

  // Helper function to convert notification type to entity model
  const getEntityModelFromType = (type) => {
    switch (type) {
      case 'message': return 'Chat';
      case 'appointment': return 'RendezVous';
      case 'medical': return 'DossierMedical';
      default: return null;
    }
  };

  // Listen to socket notifications
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      console.log('Registering socket notification handler');
      
      // Register for socket notifications
      const handleSocketNotification = (payload) => {
        console.log('Socket notification received:', payload);
        
        const newNotification = {
          _id: payload.notificationId || Date.now().toString(),
          notificationId: payload.notificationId || Date.now().toString(),
          title: payload.title || 'New Message',
          content: payload.content || '',
          createdAt: payload.createdAt || Date.now(),
          isRead: false,
          type: payload.type || 'message',
          relatedEntity: payload.chatId || payload.appointmentId,
          entityModel: getEntityModelFromType(payload.type),
        };
        
        // Add notification to Redux store
        dispatch(addNotification(newNotification));
        
        // Play sound
        playNotificationSound();
        
        // Show toast
        showToast(newNotification);
      };
      
      // Remove any existing handler to avoid duplicates
      socket.off('newNotification');
      
      // Add the handler
      socket.on('newNotification', handleSocketNotification);
      
      return () => {
        socket.off('newNotification', handleSocketNotification);
      };
    }
  }, [dispatch, showToast]);

  const deleteNotificationHandler = useCallback(async (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotificationAsync(id));
  }, [dispatch]);

  const markAllAsReadHandler = useCallback(() => {
    dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  const formatTime = (timestamp) => {
    return dayjs(timestamp).fromNow();
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    return notifications.reduce((acc, notification) => {
      const date = dayjs(notification.createdAt);
      let group;

      if (date.isAfter(today)) {
        group = 'Today';
      } else if (date.isAfter(yesterday)) {
        group = 'Yesterday';
      } else {
        group = 'Earlier';
      }

      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(notification);
      return acc;
    }, {});
  }, [notifications]);

  // This creates the dropdown menu content
  const notificationMenuItems = (
    <div className="notification-dropdown" style={{ width: 380, maxHeight: 500, overflow: 'auto', boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        borderBottom: '1px solid #eee', 
        backgroundColor: '#fafafa',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Title level={5} style={{ margin: 0 }}>Notifications</Title>
        {unreadCount > 0 && (
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={markAllAsReadHandler}
            size="small"
            ghost
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}><Spin size="large" /></div>
      ) : error ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#ff4d4f' }}>
          <p>Error loading notifications</p>
          <Button onClick={() => dispatch(fetchNotifications())}>Retry</Button>
        </div>
      ) : notifications.length > 0 ? (
        <>
          {Object.entries(groupedNotifications).map(([group, items]) => (
            <div key={group}>
              {/* Styled header */}
              <div style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f5f5f5', 
                borderBottom: '1px solid #e8e8e8',
                borderTop: '1px solid #e8e8e8',
                marginTop: group === 'Today' ? 0 : '8px',
                position: 'sticky',
                top: '44px', // Height of the Notifications header
                zIndex: 5
              }}>
                <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>{group}</Text>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={item => (
                  <List.Item
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: item.isRead ? '#fff' : '#f0f7ff',
                      padding: '12px 16px',
                      transition: 'all 0.3s',
                      borderLeft: item.isRead ? 'none' : '3px solid #1890ff',
                    }}
                    actions={[
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => deleteNotificationHandler(e, item._id || item.notificationId)}
                        title="Delete notification"
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getNotificationIcon(item.type)} 
                          style={{ backgroundColor: item.isRead ? '#f0f0f0' : '#e6f7ff' }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong={!item.isRead}>{item.title}</Text>
                        </div>
                      }
                      description={
                        <>
                          <div style={{ marginBottom: 4 }}>{item.content}</div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ClockCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginRight: 4 }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatTime(item.createdAt)}
                            </Text>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ))}
        </>
      ) : (
        <Empty 
          description="No notifications yet" 
          style={{ padding: '40px 0' }}
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomRight"
      dropdownRender={() => notificationMenuItems}
      arrow={{ pointAtCenter: true }}
    >
      <Badge 
        count={unreadCount} 
        overflowCount={99}
        offset={[-2, 2]}
      >
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: '20px' }} />} 
          style={{ height: 40, width: 40 }}
          aria-label="Notifications"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationsDropdown;
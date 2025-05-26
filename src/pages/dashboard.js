import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  BellOutlined,
  HomeOutlined,
  TeamOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  Typography,
  Divider,
  Button,
  Layout,
  Menu,
  theme,
  Dropdown,
  Avatar,
  Space,
} from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../Redux/slices/userSlice';
import NotificationDropdown from '../components/NotificationsDropdown';

const { Header, Sider, Content, Footer } = Layout;

// Sidebar menu items
const menuItems = [
  { key: '1', icon: <HomeOutlined />, label: 'Accueil', link: '/dashboard/Acceuil' },
  { key: '2', icon: <TeamOutlined />, label: 'Patients', link: '/dashboard/Patients' },
  { key: '3', icon: <ScheduleOutlined />, label: 'Rendez-vous', link: '/dashboard/Rendez-vous' },
  { key: '4', icon: <FileTextOutlined />, label: 'Articles', link: '/dashboard/Articles' },
  { key: '5', icon: <CalendarOutlined />, label: 'Agenda', link: '/dashboard/Agenda' },
  { key: '6', icon: <MessageOutlined />, label: 'Chats', link: '/dashboard/Chats' },
  { key: 'profile', icon: <UserOutlined />, label: 'Profile', link: '/dashboard/Profile' },
];

const Dashboard = () => {
  const profileImage = useSelector((state) => state.user.profile?.image);
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedItem = menuItems.find((item) => item.key === selectedKey)?.label || '';

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // This effect runs whenever the location changes
  useEffect(() => {
    updateSelectedMenuItem(location.pathname);
  }, [location]);

  // Helper function to update selected menu item based on path
  const updateSelectedMenuItem = (path) => {
    // First check for exact path matches
    const currentMenuItem = menuItems.find((item) => item.link === path);
    
    if (currentMenuItem) {
      setSelectedKey(currentMenuItem.key);
    } else {
      // If no exact match, check if the pathname starts with a menu item path
      // This handles sub-routes like /dashboard/Chats/123
      const pathParts = path.split('/');
      if (pathParts.length >= 3) {
        const basePath = `/${pathParts[1]}/${pathParts[2]}`;
        const baseMenuItem = menuItems.find((item) => item.link === basePath);
        if (baseMenuItem) {
          setSelectedKey(baseMenuItem.key);
        }
      }
    }
  };

  // Listen for custom event to force menu selection update
  useEffect(() => {
    const handleMenuSelectionUpdate = (event) => {
      const { key } = event.detail;
      if (key) {
        setSelectedKey(key);
      }
    };

    window.addEventListener('menuSelectionUpdate', handleMenuSelectionUpdate);
    
    return () => {
      window.removeEventListener('menuSelectionUpdate', handleMenuSelectionUpdate);
    };
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      localStorage.removeItem('accessToken');
      sessionStorage.clear();

      dispatch({ type: 'CLEAR_USER' }); // If you have such an action

      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Profile dropdown menu
  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: <Link to="/dashboard/Profile">Profile</Link>,
          icon: <UserOutlined />,
          onClick: () => setSelectedKey('profile'),
        },
        {
          key: 'logout',
          label: <span onClick={logout}>Logout</span>,
          icon: <UploadOutlined />,
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo Container */}
        <div 
          className="logo-container" 
          style={{ 
            height: '60px', 
            padding: collapsed ? '16px 8px' : '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'center',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }}
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              maxHeight: '60px', 
              maxWidth: collapsed ? '80%' : '80%',
            }} 
          />
          
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => {
            setSelectedKey(e.key);
            const selectedItem = menuItems.find((item) => item.key === e.key);
            if (selectedItem?.link) {
              navigate(selectedItem.link);
            }
          }}
          className="custom-menu"
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={item.link}>{item.label}</Link>,
          }))}
        />
      </Sider>

      {/* Main layout */}
      <Layout style={{ marginLeft: collapsed ? '80px' : '200px', transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 9,
            width: '100%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedItem}</span>
          </Space>

          <Space>
            <NotificationDropdown />
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <Avatar
                style={{
                  marginRight: '10px',
                  fontSize: '40px',
                  cursor: 'pointer',
                  width: 45,
                  height: 45,
                  borderRadius: '50%',
                }}
                icon={!profileImage ? <UserOutlined /> : null}
                src={profileImage}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>

        <Footer>
          <Typography
            style={{
              fontSize: '12px',
              textAlign: 'center',
              marginTop: 'auto',
              padding: '10px',
              opacity: 0.7,
            }}
          >
            © 2025 Haouech rights reserved
          </Typography>
        </Footer>
      </Layout>

      <style>
        {`
          .custom-menu .ant-menu-item-selected {
            background-color: white !important;
            color: black !important;
          }
          .custom-menu .ant-menu-item-selected .anticon {
            color: black !important;
          }
          .logo-container {
            margin: 8px 0;
          }
        `}
      </style>
    </Layout>
  );
};

export default Dashboard;
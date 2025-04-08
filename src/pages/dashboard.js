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
import { Typography, Divider, Button, Layout, Menu, theme, Dropdown, Avatar, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { useDispatch } from 'react-redux';
import { fetchUserProfile } from '../Redux/slices/userSlice';

const { Header, Sider, Content, Footer } = Layout;

// Updated menu items with appropriate icons and links
const menuItems = [
  { key: '1', icon: <HomeOutlined />, label: 'Accueil', link: '/dashboard/Acceuil' },
  { key: '2', icon: <TeamOutlined />, label: 'Patients', link: '/dashboard/Patients' },
  { key: '3', icon: <ScheduleOutlined />, label: 'Rendez-vous', link: '/dashboard/Rendez-vous' },
  { key: '4', icon: <FileTextOutlined />, label: 'Articles', link: '/dashboard/Articles' },
  { key: '5', icon: <CalendarOutlined />, label: 'Agenda', link: '/dashboard/Agenda' },
  { key: '6', icon: <MessageOutlined />, label: 'Chats', link: '/dashboard/Chats' },
  { key: 'profile', icon: <UserOutlined />, label: 'Profile', link: '/dashboard/Profile' }, // Profile added
];

const Dashboard = () => {
  const profileImage = useSelector((state) => state.user.profile?.image);
const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState(''); // State to track selected item
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation(); // Get the current route

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Find the selected menu label
  const selectedItem = menuItems.find((item) => item.key === selectedKey)?.label || '';
 useEffect(() => {
    dispatch(fetchUserProfile());
    console.log("Fetching user profile...");
    console.log("User Profile:", profileImage);

  }, [dispatch]);
  // Function to sync selectedKey with the current route
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) => item.link === location.pathname);
    if (currentMenuItem) {
      setSelectedKey(currentMenuItem.key); // Update selectedKey based on the current route
    }
  }, [location]); // Trigger this effect whenever the route changes

  // Profile Dropdown Menu
  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: <Link to="/dashboard/Profile">Profile</Link>,
          icon: <UserOutlined />,
          onClick: () => setSelectedKey('profile'), // Update selectedKey to 'profile'
        },
        {
          key: 'logout',
          label: <Link to="/logout">Logout</Link>,
          icon: <UploadOutlined />,
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => {
            setSelectedKey(e.key); // Update selected key on click
            const selectedItem = menuItems.find((item) => item.key === e.key);
            if (selectedItem?.link) {
              navigate(selectedItem.link); // Navigate to the route
            }
          }}
          className="custom-menu"
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={item.link}>{item.label}</Link>, // Wrap label with Link
          }))}
        />
      </Sider>
      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: colorBgContainer,
          }}
        >
          {/* Left Section: Collapse Icon + Selected Item Name */}
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedItem}</span>
          </Space>
          {/* Right Section: Notifications + Profile */}
          <Space>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ marginTop: '20px', marginRight: '10px', fontSize: '22px' }}
            />
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <Avatar
                style={{ marginRight: '10px', fontSize: '40px', cursor: 'pointer',    width: 45, height: 45, borderRadius: "50%"  
              }}
                icon={!profileImage ? <UserOutlined /> : null}
                src={profileImage}
              />
            </Dropdown>
          </Space>
        </Header>
        {/* Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            // background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Render child components here */}
          <Outlet />
        </Content>
        <Footer>
          {/* Footer Typography */}
          <Typography
            style={{
              fontSize: '12px',
              textAlign: 'center',
              marginTop: 'auto', // Pushes the typography to the bottom
              padding: '10px',
              opacity: 0.7,
            }}
          >
            © 2025 Haouech rights reserved
          </Typography>
        </Footer>
      </Layout>
      {/* Custom Styles */}
      <style>
        {`
          .custom-menu .ant-menu-item-selected {
            background-color: white !important; /* White background */
            color: black !important; /* Dark text */
          }
          .custom-menu .ant-menu-item-selected .anticon {
            color: black !important; /* Dark icon */
          }
        `}
      </style>
    </Layout>
  );
};

export default Dashboard;
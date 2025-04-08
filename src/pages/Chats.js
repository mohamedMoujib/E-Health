import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Badge,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  DialogActions
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';

// Redux actions
import { 
  fetchChats, 
  fetchMessages, 
  sendMessage,
  createChat,
  sendImageMessage

} from '../Redux/slices/chatSlice';
import { setSelectedChat } from '../Redux/slices/chatSlice';
import PatientSelectionDialog from '../components/PatientSelectionDialog';

// Custom styled components
const GlassCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha('#0A192F', 0.9)} 0%, ${alpha('#0A192F', 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: 3,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
  overflow: 'hidden',
  height: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column'
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '75%',
  padding: theme.spacing(1.5, 2),
  borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
  marginBottom: theme.spacing(1.5),
  wordBreak: 'break-word',
  backgroundColor: isUser ? '#0A192F' : theme.palette.background.paper,
  color: isUser ? '#ffffff' : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }
}));

const ContactItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: active ? alpha('#0A192F', 0.1) : 'transparent',
  '&:hover': {
    backgroundColor: alpha('#0A192F', 0.05),
    transform: 'translateX(4px)'
  }
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(3, 2),
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  background: `linear-gradient(${alpha('#f5f7fa', 0.8)}, ${alpha('#f5f7fa', 0.8)})`,
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#0A192F', 0.05),
    borderRadius: '10px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#0A192F', 0.2),
    borderRadius: '10px',
    '&:hover': {
      background: alpha('#0A192F', 0.3)
    }
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    '& fieldset': {
      borderColor: alpha('#0A192F', 0.1)
    },
    '&:hover fieldset': {
      borderColor: alpha('#0A192F', 0.2)
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0A192F',
      boxShadow: '0 0 0 2px rgba(10, 25, 47, 0.2)'
    }
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${alpha('#0A192F', 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 10
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha('#0A192F', 0.1)}`,
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: theme.palette.background.paper
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    '&:hover': {
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
    }
  }
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center', 
  padding: theme.spacing(2), 
  borderTop: `1px solid ${alpha('#0A192F', 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  bottom: 0,
  zIndex: 10
}));

const ContactsList = styled(List)(({ theme }) => ({
  overflow: 'auto',
  flex: 1,
  padding: theme.spacing(2),
  height: '100%'
}));

const Chats = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const userId = useSelector((state) => state.user?.profile?._id); 

  const chatState = useSelector((state) => {
    if (!state) return {
      chats: [],
      messages: [],
      selectedChat: null,
      loading: false,
      error: null
    };
    if (!state.chat) return {
      chats: [],
      messages: [],
      selectedChat: null,
      loading: false,
      error: null
    };
    return state.chat;
  });

  const chats = chatState.chats || [];
  const messages = chatState.messages || [];
  const selectedChat = chatState.selectedChat || null;
  const loading = typeof chatState.loading === 'boolean' ? chatState.loading : false;
  const error = chatState.error || null;
  
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchChats());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (selectedChat?._id) {
      dispatch(fetchMessages(selectedChat._id));
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;
  
    dispatch(sendMessage({
      chatId: selectedChat._id,
      content: messageInput,
      type: 'text'
    }));
  
    setMessageInput('');
  };

  
  const handlePatientSelect = (patient) => {
    if (!patient._id) {
      alert("Invalid patient selection.");
      return;
    }
    
    dispatch(createChat({ 
      doctorId: userId, 
      patientId: patient._id 
    }));
    dispatch(fetchChats());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.patient;
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant.firstName?.toLowerCase().includes(searchLower) ||
      otherParticipant.lastName?.toLowerCase().includes(searchLower) ||
      `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const getMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getMessageDateTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${format(messageDate, 'HH:mm')}`;
    }
    else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(messageDate, 'HH:mm')}`;
    }
    else {
      return format(messageDate, 'MMM d, yyyy at HH:mm');
    }
  };

  const getParticipantName = (participant) => {
    if (!participant) return 'Unknown';
    return `${participant.firstName || ''} ${participant.lastName || ''}`.trim();
  };

  const getImageUrl = (participant) => {
    return participant?.image || '';
  };

  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    
    dispatch(sendImageMessage({
      chatId: selectedChat._id,
      file
    }));
    
    // Reset file input
    e.target.value = '';
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  return (
    <GlassCard>
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleSendImage}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <Grid container sx={{ height: '100%' }}>
        {/* Left sidebar - Contacts */}
        <Grid item xs={12} md={4} lg={4} sx={{
          borderRight: `1px solid ${alpha('#0A192F', 0.1)}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          position: 'relative',
        }}>
          <SidebarHeader>
            <Typography variant="h4" fontWeight={600}  gutterBottom sx={{fontSize: { xs: '1.5rem', md: '2rem' }
, color: '#0A192F' }}>
              Discussions
            </Typography>
            <SearchField
              fullWidth
              placeholder="Search contacts..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="center">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2,mt: 3 , width: '100%',}}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={() => setPatientDialogOpen(true)}
              sx={{
                ml: 7,
                width: '70%',
                borderRadius: '12px',
                py: 1.5,
                backgroundColor: '#0A192F',
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#0A192F', 0.9),
                  boxShadow: '0 4px 12px rgba(10, 25, 47, 0.2)'
                }
              }}
            >
              New Conversation
            </Button>
          </SidebarHeader>
          
          <ContactsList sx={{ height: 'calc(100% - 173px)' }}>
            {loading.chats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} sx={{ color: '#0A192F' }} />
              </Box>
            ) : error.chats ? (
              <Typography color="error" sx={{ p: 2 }}>
                {error.chats}
              </Typography>
            ) : filteredChats.length === 0 ? (
              <EmptyState>
                <Typography variant="body2">No conversations found</Typography>
              </EmptyState>
            ) : (
              filteredChats.map((chat) => {
                const otherParticipant = chat.patient;
                const isActive = selectedChat?._id === chat._id;
                
                return (
                  <ContactItem 
                    key={chat._id}
                    active={isActive}
                    onClick={() => dispatch(setSelectedChat(chat))}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color="primary"
                        invisible={!chat.unreadCount}
                      >
                        <Avatar 
                          src={getImageUrl(otherParticipant)}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            bgcolor: '#0A192F',
                            fontSize: '1rem',
                            mr: 2
                          }}
                        >
                          {getParticipantName(otherParticipant).charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={(
                        <Typography variant="subtitle1" fontWeight={600}>
                          {getParticipantName(otherParticipant)}
                        </Typography>
                      )}
                      secondary={
                        <Typography 
                          variant="body2" 
                          color={isActive ? 'text.primary' : 'text.secondary'}
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px'
                          }}
                        >
                          {chat?.lastMessage?.content || 'No messages yet'}
                        </Typography>
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {chat?.lastMessage?.timestamp ? 
                        getMessageTime(chat.lastMessage.timestamp) : ''}
                    </Typography>
                  </ContactItem>
                );
              })
            )}
          </ContactsList>
        </Grid>

        {/* Right side - Chat area */}
        <Grid item xs={12} md={8} lg={8} sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.default',
          height: '100%',
          position: 'relative'
        }}>
          {selectedChat ? (
            <>
              <ChatHeader>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={selectedChat.patient.image}
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      mr: 2,
                      bgcolor: '#0A192F'
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {getParticipantName(selectedChat.patient)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Online
                    </Typography>
                  </Box>
                </Box>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </ChatHeader>

              <MessageList sx={{ height: 'calc(100% - 144px)' }}>
                {loading.messages ? (
                  <CircularProgress size={24} sx={{ alignSelf: 'center', color: '#0A192F' }} />
                ) : messages.length === 0 ? (
                  <EmptyState>
                    <Typography variant="h6" sx={{ mb: 1, color: '#0A192F' }}>
                      No messages yet
                    </Typography>
                    <Typography variant="body2">
                      Send a message to start the conversation
                    </Typography>
                  </EmptyState>
                ) : (
                  messages.map((message) => (
                    <MessageBubble 
                      key={message._id} 
                      isUser={message.sender === userId}
                    >
                      {message.type === 'image' ? (
                        <Box sx={{ maxWidth: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                          <img 
                            src={message.content} 
                            alt="Sent content" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px',
                              display: 'block'
                            }} 
                          />
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                          {message.content}
                        </Typography>
                      )}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'right', 
                          marginTop: 1,
                          color: message.sender === userId ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                        }}
                      >
                        {getMessageDateTime(message.timestamp)}
                      </Typography>
                    </MessageBubble>
                  ))
                )}
                <div ref={messagesEndRef} />
              </MessageList>

              <InputArea
                component="form"
                onSubmit={handleSendMessage}
              >
                <IconButton 
                  sx={{ mr: 1 }}
                  onClick={handleAttachClick}
                >
                  <AttachFileIcon />
                </IconButton>
                <MessageInput
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={!messageInput.trim()}
                  sx={{
                    backgroundColor: '#0A192F',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: alpha('#0A192F', 0.9)
                    },
                    '&:disabled': {
                      backgroundColor: alpha('#0A192F', 0.5)
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputArea>
            </>
              
          ) : (
            <EmptyState sx={{ backgroundColor: 'background.default' }}>
              <Box sx={{ 
                width: 120, 
                height: 120, 
                backgroundColor: alpha('#0A192F', 0.1),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}>
                <SearchIcon sx={{ fontSize: 60, color: alpha('#0A192F', 0.3) }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, color: '#0A192F' }}>
                Select a conversation
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, maxWidth: '60%', textAlign: 'center' }}>
                Choose an existing conversation or start a new one by clicking the button below
              </Typography>
              <Button
                variant="contained"
                onClick={() => setPatientDialogOpen(true)}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#0A192F',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#0A192F', 0.9)
                  }
                }}
              >
                Start New Chat
              </Button>
            </EmptyState>
          )}
        </Grid>
      </Grid>
      
      <PatientSelectionDialog
        open={patientDialogOpen}
        onClose={() => setPatientDialogOpen(false)}
        onSelectPatient={handlePatientSelect}
      />
    </GlassCard>
  );
};

export default Chats;
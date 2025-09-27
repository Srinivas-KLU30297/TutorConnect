import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Typography, TextField, List, ListItem, ListItemText, 
  Button, Card, CardContent, Avatar, Paper, Divider, Grid, 
  InputAdornment, IconButton, Chip, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Badge
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from "../../context/AuthContext";
import bookingService from "../../services/bookingService";

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [fileDialog, setFileDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      markMessagesAsRead();
      // Set up typing status checker
      const interval = setInterval(checkTypingStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = () => {
    const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
    const convs = bookingService.getUserConversations(user.name, userRole);
    setConversations(convs);
    
    if (convs.length > 0 && !activeConversation) {
      setActiveConversation(convs[0]);
    }
  };

  const loadMessages = () => {
    if (activeConversation) {
      const msgs = bookingService.getConversationMessages(activeConversation.id);
      setMessages(msgs);
    }
  };

  const markMessagesAsRead = () => {
    if (activeConversation) {
      const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
      bookingService.markMessagesAsRead(activeConversation.id, user.name, userRole);
      loadConversations(); // Refresh to update unread counts
    }
  };

  const checkTypingStatus = () => {
    if (activeConversation) {
      const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
      const conversation = bookingService.conversations.find(c => c.id === activeConversation.id);
      if (conversation) {
        const isPartnerTyping = userRole === 'tutor' ? conversation.typing_student : conversation.typing_tutor;
        setPartnerTyping(isPartnerTyping);
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation || !user) return;
    
    const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
    const receiverName = userRole === 'tutor' ? activeConversation.student_name : activeConversation.tutor_name;
    
    const messageData = {
      conversation_id: activeConversation.id,
      sender_name: user.name,
      sender_role: userRole,
      receiver_name: receiverName,
      message: newMessage.trim(),
      type: 'text'
    };
    
    bookingService.sendMessage(messageData);
    setNewMessage("");
    loadMessages();
    loadConversations(); // Refresh to update last message
    
    // Clear typing status
    setIsTyping(false);
    bookingService.setTypingStatus(activeConversation.id, user.name, userRole, false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
      bookingService.setTypingStatus(activeConversation.id, user.name, userRole, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing status
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
        bookingService.setTypingStatus(activeConversation.id, user.name, userRole, false);
      }
    }, 2000);
  };

  const handleFileUpload = async (file) => {
    if (!file || !activeConversation || !user) return;

    setUploadingFile(true);
    try {
      const fileData = await bookingService.uploadFile(file, activeConversation.id);
      
      const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
      const receiverName = userRole === 'tutor' ? activeConversation.student_name : activeConversation.tutor_name;
      
      const messageData = {
        conversation_id: activeConversation.id,
        sender_name: user.name,
        sender_role: userRole,
        receiver_name: receiverName,
        message: `Shared a file: ${file.name}`,
        type: 'file',
        file_url: fileData.data,
        file_name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size
      };
      
      bookingService.sendMessage(messageData);
      loadMessages();
      loadConversations();
      setFileDialog(false);
      
    } catch (error) {
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadFile = (message) => {
    if (message.file_url) {
      const link = document.createElement('a');
      link.href = message.file_url;
      link.download = message.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    return <DescriptionIcon />;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startVideoCall = () => {
    if (activeConversation) {
      const roomId = activeConversation.id.replace(/\s+/g, '-');
      window.open(`https://meet.jit.si/tutorconnect-${roomId}`, '_blank');
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Please login to access chat</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Messages 💬
      </Typography>

      <Grid container spacing={2} sx={{ height: '75vh' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                Conversations ({conversations.length})
              </Typography>
              <Divider />
              
              {conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No conversations yet. Book a session to start chatting!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0, maxHeight: '600px', overflow: 'auto' }}>
                  {conversations.map((conv) => {
                    const userRole = user.role || (user.name === localStorage.getItem('tutorconnect_user_name') ? 'tutor' : 'student');
                    const unreadCount = userRole === 'tutor' ? conv.unread_count_tutor : conv.unread_count_student;
                    const partnerName = userRole === 'tutor' ? conv.student_name : conv.tutor_name;
                    
                    return (
                      <ListItem
                        key={conv.id}
                        button
                        selected={activeConversation?.id === conv.id}
                        onClick={() => setActiveConversation(conv)}
                        sx={{ 
                          py: 2,
                          borderBottom: '1px solid #f0f0f0',
                          '&.Mui-selected': {
                            backgroundColor: 'primary.50',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main'
                          }
                        }}
                      >
                        <Badge badgeContent={unreadCount} color="primary">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {partnerName.charAt(0)}
                          </Avatar>
                        </Badge>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: unreadCount > 0 ? 700 : 600 }}>
                                {partnerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(conv.last_message_time)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                📚 {conv.subject} • {conv.session_date}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontWeight: unreadCount > 0 ? 600 : 400
                                }}
                              >
                                {conv.last_message}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          {!activeConversation ? (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start chatting
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {(user.role === 'tutor' ? activeConversation.student_name : activeConversation.tutor_name).charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user.role === 'tutor' ? activeConversation.student_name : activeConversation.tutor_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📚 {activeConversation.subject} • {activeConversation.session_date} at {activeConversation.session_time}
                    </Typography>
                    {partnerTyping && (
                      <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
                        typing...
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={startVideoCall} color="primary" title="Start Video Call">
                    <VideoCallIcon />
                  </IconButton>
                  <IconButton color="primary" title="Schedule Session">
                    <ScheduleIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isMe = msg.sender_name === user.name;
                    return (
                      <MotionPaper
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          bgcolor: isMe ? 'primary.main' : 'grey.100',
                          color: isMe ? 'white' : 'text.primary',
                          borderRadius: isMe ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          position: 'relative'
                        }}
                      >
                        {msg.type === 'welcome' && (
                          <Chip 
                            label="Welcome Message" 
                            size="small" 
                            sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                          />
                        )}
                        
                        {msg.type === 'file' ? (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getFileIcon(msg.file_type)}
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                                {msg.file_name}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {formatFileSize(msg.file_size)}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {msg.file_type.startsWith('image/') && (
                                <img 
                                  src={msg.file_url} 
                                  alt={msg.file_name}
                                  style={{ 
                                    maxWidth: '200px', 
                                    maxHeight: '200px', 
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => window.open(msg.file_url, '_blank')}
                                />
                              )}
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => downloadFile(msg)}
                                sx={{ 
                                  mt: 1, 
                                  color: isMe ? 'white' : 'primary.main',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                              >
                                Download
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.4
                            }}
                          >
                            {msg.message}
                          </Typography>
                        )}
                        
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </MotionPaper>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      }
                    }}
                  />
                  <IconButton 
                    color="primary"
                    onClick={() => setFileDialog(true)}
                    sx={{ mb: 0.5 }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                  <IconButton 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    color="primary"
                    sx={{ mb: 0.5 }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* File Upload Dialog */}
      <Dialog open={fileDialog} onClose={() => setFileDialog(false)}>
        <DialogTitle>Share File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share documents, images, or other files with your partner.
          </Typography>
          
          {uploadingFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Uploading file...</Typography>
              <LinearProgress />
            </Box>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
          />
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => {
                fileInputRef.current.accept = "image/*";
                fileInputRef.current.click();
              }}
              disabled={uploadingFile}
            >
              Image
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => {
                fileInputRef.current.accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx";
                fileInputRef.current.click();
              }}
              disabled={uploadingFile}
            >
              Document
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

class BookingService {
  constructor() {
    this.bookings = JSON.parse(localStorage.getItem('tutorconnect_bookings') || '[]');
    this.conversations = JSON.parse(localStorage.getItem('tutorconnect_conversations') || '[]');
    this.messages = JSON.parse(localStorage.getItem('tutorconnect_messages') || '[]');
    this.sessions = JSON.parse(localStorage.getItem('tutorconnect_sessions') || '[]');
    this.notifications = JSON.parse(localStorage.getItem('tutorconnect_notifications') || '[]');
    this.files = JSON.parse(localStorage.getItem('tutorconnect_files') || '[]');
    this.myStudents = JSON.parse(localStorage.getItem('tutorconnect_my_students') || '[]');
    this.mySessions = JSON.parse(localStorage.getItem('tutorconnect_my_sessions') || '[]');
  }

  saveData() {
    localStorage.setItem('tutorconnect_bookings', JSON.stringify(this.bookings));
    localStorage.setItem('tutorconnect_conversations', JSON.stringify(this.conversations));
    localStorage.setItem('tutorconnect_messages', JSON.stringify(this.messages));
    localStorage.setItem('tutorconnect_sessions', JSON.stringify(this.sessions));
    localStorage.setItem('tutorconnect_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('tutorconnect_files', JSON.stringify(this.files));
    localStorage.setItem('tutorconnect_my_students', JSON.stringify(this.myStudents));
    localStorage.setItem('tutorconnect_my_sessions', JSON.stringify(this.mySessions));
  }

  // Create booking request
  createBookingRequest(bookingData) {
    const booking = {
      id: Date.now(),
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.bookings.push(booking);
    
    // Create notification for tutor
    this.addNotification({
      user_name: bookingData.tutor_name,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${bookingData.student_name} wants to book a session for ${bookingData.subject}`,
      data: booking
    });
    
    this.saveData();
    console.log('✅ Booking request created:', booking);
    return booking;
  }

  // Update booking status with complete workflow
  updateBookingStatus(bookingId, status) {
    const booking = this.bookings.find(b => b.id == bookingId);
    if (!booking) return null;

    booking.status = status;
    booking.updated_at = new Date().toISOString();

    if (status === 'confirmed') {
      console.log('🎉 Confirming booking:', booking);
      
      // 1. Create conversation
      const conversation = this.createConversation(booking);
      console.log('✅ Conversation created:', conversation);
      
      // 2. Create session record
      const session = this.createSession(booking);
      console.log('✅ Session created:', session);
      
      // 3. Send welcome message
      this.sendWelcomeMessage(booking, conversation.id);
      console.log('✅ Welcome message sent');
      
      // 4. Add to My Students (for tutor)
      this.addToMyStudents(booking);
      console.log('✅ Added to My Students');
      
      // 5. Add to My Sessions (for student)
      this.addToMySessions(booking);
      console.log('✅ Added to My Sessions');
      
      // 6. Notify student
      this.addNotification({
        user_name: booking.student_name,
        type: 'booking_confirmed',
        title: 'Booking Confirmed! 🎉',
        message: `Your session with ${booking.tutor_name} has been confirmed for ${booking.requested_date}`,
        data: { booking, session, conversation_id: conversation.id }
      });
      
    } else if (status === 'declined') {
      this.addNotification({
        user_name: booking.student_name,
        type: 'booking_declined',
        title: 'Booking Request Declined',
        message: `${booking.tutor_name} is unavailable for your requested time. Please try a different slot.`,
        data: booking
      });
    }

    this.saveData();
    return booking;
  }

  // Create conversation when booking is confirmed
  createConversation(booking) {
    const conversationId = `${booking.tutor_name}_${booking.student_name}_${booking.id}`.replace(/\s+/g, '_');
    
    // Check if conversation already exists
    const existingConv = this.conversations.find(c => c.id === conversationId);
    if (existingConv) return existingConv;

    const conversation = {
      id: conversationId,
      booking_id: booking.id,
      tutor_name: booking.tutor_name,
      student_name: booking.student_name,
      student_email: booking.student_email,
      subject: booking.subject,
      session_date: booking.requested_date,
      session_time: booking.requested_time,
      duration: booking.duration,
      status: 'active',
      created_at: new Date().toISOString(),
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count_tutor: 0,
      unread_count_student: 1,
      typing_tutor: false,
      typing_student: false
    };

    this.conversations.push(conversation);
    return conversation;
  }

  // Create session record
  createSession(booking) {
    const session = {
      id: Date.now(),
      booking_id: booking.id,
      tutor_name: booking.tutor_name,
      student_name: booking.student_name,
      student_email: booking.student_email,
      subject: booking.subject,
      scheduled_date: booking.requested_date,
      scheduled_time: booking.requested_time,
      duration: booking.duration,
      status: 'scheduled',
      meeting_link: this.generateMeetingLink(),
      total_cost: booking.total_cost,
      created_at: new Date().toISOString(),
      materials: [],
      notes: '',
      rating: null
    };

    this.sessions.push(session);
    return session;
  }

  // Send welcome message from tutor
  sendWelcomeMessage(booking, conversationId) {
    const welcomeMessage = `🎉 Welcome ${booking.student_name}! 

I'm excited to help you with ${booking.subject}! Here are the details of our upcoming session:

📅 **Session Details:**
• Date: ${booking.requested_date}
• Time: ${booking.requested_time}
• Duration: ${booking.duration} minutes
• Subject: ${booking.subject}
• Cost: ₹${Math.round(booking.total_cost)}

📚 **What to expect:**
• We'll cover the topics you mentioned: "${booking.message}"
• Please come prepared with any specific questions
• I'll share materials and notes as we progress

💬 **Communication:**
• Use this chat for any questions before our session
• Share files, documents, or images if needed
• I typically respond within a few hours

Looking forward to our session! Feel free to ask any questions. 😊

Best regards,
${booking.tutor_name}`;

    this.sendMessage({
      conversation_id: conversationId,
      sender_name: booking.tutor_name,
      sender_role: 'tutor',
      receiver_name: booking.student_name,
      message: welcomeMessage,
      type: 'welcome'
    });
  }

  // Add to My Students section for tutor
  addToMyStudents(booking) {
    const existingIndex = this.myStudents.findIndex(s => 
      s.tutor_name === booking.tutor_name && s.student_email === booking.student_email
    );

    if (existingIndex >= 0) {
      // Update existing student record
      this.myStudents[existingIndex].sessions_count++;
      this.myStudents[existingIndex].total_earnings += booking.total_cost;
      this.myStudents[existingIndex].last_session = booking.requested_date;
    } else {
      // Add new student
      const studentRecord = {
        id: Date.now(),
        tutor_name: booking.tutor_name,
        student_name: booking.student_name,
        student_email: booking.student_email,
        subject: booking.subject,
        sessions_count: 1,
        total_earnings: booking.total_cost,
        first_session: booking.requested_date,
        last_session: booking.requested_date,
        status: 'active',
        created_at: new Date().toISOString()
      };
      this.myStudents.push(studentRecord);
    }
  }

  // Add to My Sessions section for student
  addToMySessions(booking) {
    const sessionRecord = {
      id: Date.now(),
      booking_id: booking.id,
      student_name: booking.student_name,
      student_email: booking.student_email,
      tutor_name: booking.tutor_name,
      subject: booking.subject,
      session_date: booking.requested_date,
      session_time: booking.requested_time,
      duration: booking.duration,
      cost: booking.total_cost,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    this.mySessions.push(sessionRecord);
  }

  // Enhanced message sending with file support
  sendMessage(messageData) {
    const message = {
      id: Date.now(),
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false,
      file_url: messageData.file_url || null,
      file_name: messageData.file_name || null,
      file_type: messageData.file_type || null,
      file_size: messageData.file_size || null
    };

    this.messages.push(message);

    // Update conversation
    const conversation = this.conversations.find(c => c.id === messageData.conversation_id);
    if (conversation) {
      conversation.last_message = messageData.file_name ? 
        `📎 ${messageData.file_name}` : 
        messageData.message.substring(0, 50) + (messageData.message.length > 50 ? '...' : '');
      conversation.last_message_time = new Date().toISOString();
      
      // Update unread counts
      if (messageData.sender_role === 'tutor') {
        conversation.unread_count_student++;
      } else {
        conversation.unread_count_tutor++;
      }
    }

    this.saveData();
    return message;
  }

  // Get conversations for user
  getUserConversations(userName, userRole) {
    return this.conversations.filter(c => {
      if (userRole === 'tutor') {
        return c.tutor_name === userName;
      } else {
        return c.student_name === userName;
      }
    }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
  }

  // Get messages for conversation
  getConversationMessages(conversationId) {
    return this.messages.filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Mark messages as read
  markMessagesAsRead(conversationId, userName, userRole) {
    this.messages
      .filter(m => m.conversation_id === conversationId && m.receiver_name === userName)
      .forEach(m => m.read = true);

    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      if (userRole === 'tutor') {
        conversation.unread_count_tutor = 0;
      } else {
        conversation.unread_count_student = 0;
      }
    }

    this.saveData();
  }

  // Set typing status
  setTypingStatus(conversationId, userName, userRole, isTyping) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      if (userRole === 'tutor') {
        conversation.typing_tutor = isTyping;
      } else {
        conversation.typing_student = isTyping;
      }
      this.saveData();
    }
  }

  // Get My Students (for tutor)
  getMyStudents(tutorName) {
    return this.myStudents.filter(s => s.tutor_name === tutorName);
  }

  // Get My Sessions (for student)
  getMySessions(studentEmail) {
    return this.mySessions.filter(s => s.student_email === studentEmail);
  }

  // Add notification
  addNotification(notificationData) {
    const notification = {
      id: Date.now(),
      ...notificationData,
      read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.push(notification);
    return notification;
  }

  // Get user notifications
  getUserNotifications(userName) {
    return this.notifications.filter(n => n.user_name === userName)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Generate meeting link
  generateMeetingLink() {
    const roomId = Math.random().toString(36).substring(7);
    return `https://meet.jit.si/tutorconnect-${roomId}`;
  }

  // Get tutor bookings
  getTutorBookings(tutorName) {
    return this.bookings.filter(booking => 
      booking.tutor_name && booking.tutor_name.toLowerCase() === tutorName.toLowerCase()
    );
  }

  // Get student bookings
  getStudentBookings(studentEmail) {
    return this.bookings.filter(booking => booking.student_email === studentEmail);
  }

  // Get user sessions
  getUserSessions(userName, userRole) {
    if (userRole === 'tutor') {
      return this.sessions.filter(s => s.tutor_name === userName);
    } else {
      return this.sessions.filter(s => s.student_name === userName);
    }
  }

  // File upload handler
  uploadFile(file, conversationId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          conversation_id: conversationId,
          uploaded_at: new Date().toISOString()
        };

        this.files.push(fileData);
        this.saveData();
        resolve(fileData);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get all data (for debugging)
  getAllData() {
    console.log('=== BOOKING SERVICE DEBUG ===');
    console.log('Bookings:', this.bookings);
    console.log('My Students:', this.myStudents);
    console.log('My Sessions:', this.mySessions);
    console.log('Conversations:', this.conversations);
    console.log('Messages:', this.messages);
    console.log('==============================');
    
    return {
      bookings: this.bookings,
      conversations: this.conversations,
      messages: this.messages,
      sessions: this.sessions,
      notifications: this.notifications,
      files: this.files,
      myStudents: this.myStudents,
      mySessions: this.mySessions
    };
  }

  // Clear all data (for testing)
  clearAllData() {
    this.bookings = [];
    this.conversations = [];
    this.messages = [];
    this.sessions = [];
    this.notifications = [];
    this.files = [];
    this.myStudents = [];
    this.mySessions = [];
    
    localStorage.removeItem('tutorconnect_bookings');
    localStorage.removeItem('tutorconnect_conversations');
    localStorage.removeItem('tutorconnect_messages');
    localStorage.removeItem('tutorconnect_sessions');
    localStorage.removeItem('tutorconnect_notifications');
    localStorage.removeItem('tutorconnect_files');
    localStorage.removeItem('tutorconnect_my_students');
    localStorage.removeItem('tutorconnect_my_sessions');
  }
}

const bookingService = new BookingService();
export default bookingService;

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Search, Send, Paperclip, MessageCircle, MoreVertical } from 'lucide-react';

export default function Messages() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const userIdFromUrl = searchParams.get('user');

  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useQuery('conversations', async () => {
    console.log('🔍 Fetching conversations...');
    const res = await api.get('/messages/conversations');
    console.log('✅ Conversations loaded:', res.data.conversations);
    return res.data.conversations;
  });

  // Auto-select conversation if user ID is in URL
  useEffect(() => {
    console.log('🔍 User ID from URL:', userIdFromUrl);
    console.log('🔍 Conversations:', conversations);
    
    if (userIdFromUrl && conversations) {
      const conversation = conversations.find(
        conv => conv.participants.some(p => p._id === userIdFromUrl)
      );
      
      console.log('🔍 Found conversation:', conversation);
      
      if (conversation) {
        console.log('✅ Opening existing conversation:', conversation._id);
        setSelectedConversation(conversation._id);
      } else {
        console.log('📝 Creating new conversation with user:', userIdFromUrl);
        createConversation(userIdFromUrl);
      }
    }
  }, [userIdFromUrl, conversations]);

  const createConversation = async (recipientId) => {
    try {
      console.log('📝 Creating conversation with recipient:', recipientId);
      const res = await api.post('/messages/conversations', {
        recipientId
      });
      console.log('✅ Conversation created:', res.data.conversation);
      setSelectedConversation(res.data.conversation._id);
      // Refresh conversations list without reload
      queryClient.invalidateQueries('conversations');
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to start conversation: ${error.response?.data?.message || error.message}`);
    }
  };

  const { data: messages, isLoading: messagesLoading } = useQuery(
    ['messages', selectedConversation],
    async () => {
      if (!selectedConversation) return [];
      const res = await api.get(`/messages/conversations/${selectedConversation}/messages`);
      return res.data.messages;
    },
    { enabled: !!selectedConversation }
  );

  const filteredConversations = conversations?.filter(conv => {
    const other = conv.participants?.find(p => p._id !== user?._id);
    return other?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get other user in selected conversation
  const selectedConv = conversations?.find(c => c._id === selectedConversation);
  const otherUser = selectedConv?.participants?.find(p => p._id !== user?._id);

  if (conversationsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="card p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="card p-0 overflow-hidden" style={{ height: '600px' }}>
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!filteredConversations || filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start chatting with sellers or buyers</p>
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conv) => {
                    const other = conv.participants?.find(p => p._id !== user?._id);
                    // unreadCount is a Map in MongoDB but becomes object in JSON
                    const unread = conv.unreadCount?.[user?._id] || 0;
                    
                    return (
                      <div
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv._id)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === conv._id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={other?.avatar || '/avatar.jpg'}
                            alt={other?.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900 truncate">{other?.displayName}</p>
                              {unread > 0 && (
                                <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-8 flex flex-col">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</p>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={otherUser?.avatar || '/avatar.jpg'}
                      alt={otherUser?.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{otherUser?.displayName}</p>
                      <p className="text-sm text-gray-600">@{otherUser?.username}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(600px - 140px)' }}>
                  {messagesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading messages...</p>
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender?._id === user?._id;
                      
                      return (
                        <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md ${isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1">{message.sender?.displayName}</p>
                            )}
                            {message.attachment && (
                              <div className="mb-2">
                                {message.attachment.mimetype?.startsWith('image/') ? (
                                  <img 
                                    src={message.attachment.url} 
                                    alt="Attachment" 
                                    className="max-w-full rounded cursor-pointer"
                                    onClick={() => window.open(message.attachment.url, '_blank')}
                                  />
                                ) : (
                                  <a 
                                    href={message.attachment.url} 
                                    download={message.attachment.filename}
                                    className={`flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-primary-700' : 'bg-gray-200'}`}
                                  >
                                    <Paperclip className="w-4 h-4" />
                                    <span className="text-sm">{message.attachment.filename}</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {message.content && <p className="text-sm">{message.content}</p>}
                            <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  {attachedFile && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded">
                      <Paperclip className="w-4 h-4 text-gray-600" />
                      <span className="text-sm flex-1">{attachedFile.name} ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button 
                        onClick={() => setAttachedFile(null)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert('File size must be less than 10MB');
                              return;
                            }
                            setAttachedFile(file);
                          }
                        }}
                      />
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => {
                          // Limit to 1000 characters
                          if (e.target.value.length <= 1000) {
                            setMessageText(e.target.value);
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && messageText.trim()) {
                            // Send message
                            const sendBtn = document.getElementById('send-message-btn');
                            if (sendBtn) sendBtn.click();
                          }
                        }}
                      />
                      <div className="absolute -top-5 right-0 text-xs text-gray-500">
                        {messageText.length}/1000
                      </div>
                    </div>
                    <button 
                      id="send-message-btn"
                      onClick={async () => {
                        if (!messageText.trim() && !attachedFile) return;
                        try {
                          const formData = new FormData();
                          if (messageText.trim()) {
                            formData.append('content', messageText);
                          }
                          if (attachedFile) {
                            formData.append('attachment', attachedFile);
                          }
                          
                          await api.post(`/messages/conversations/${selectedConversation}/messages`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          
                          setMessageText('');
                          setAttachedFile(null);
                          // Refresh messages
                          queryClient.invalidateQueries(['messages', selectedConversation]);
                        } catch (error) {
                          console.error('Send message error:', error);
                          alert(error.response?.data?.message || 'Failed to send message');
                        }
                      }}
                      disabled={!messageText.trim() && !attachedFile}
                      className="btn-primary"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

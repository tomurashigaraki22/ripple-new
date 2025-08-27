"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { X, Send, Smile, Camera, Flag } from "lucide-react"
import EmojiPicker from "emoji-picker-react"
import { io } from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"

export function ChatModal({ isOpen, onClose, order, userType, userId, user }) {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("Connecting…") // New status
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  // New state for improved image upload
  const [uploadProgress, setUploadProgress] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);  
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const startY = useRef(null)
  const modalRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!user || !order) return;

    // Initialize socket connection
    const newSocket = io("https://ripple-websocket-server.onrender.com", {
      transports: ['websocket'],
      upgrade: false
    });

    const m = {
      order_id: order.id,
      user_id: user.userId,
      user_type: userType
    }

    console.log("Details: ", m)

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus("Connected");
      setIsConnected(true);
      newSocket.emit('join_room', {
        order_id: order.id,
        user_id: user.userId,
        user_type: userType
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setConnectionStatus("Disconnected");
    });

    newSocket.on('recent_messages', (recentMessages) => {
      console.log('Received recent messages:', recentMessages);
      setMessages(recentMessages);
    });

    newSocket.on('new_message', (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionStatus("Failed");
      alert(error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, order, userType]);
  
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [newMessage])

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    console.log('Sending message:', newMessage.trim());
    socket.emit('send_message', {
      message: newMessage.trim()
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const generateSignature = async (params) => {
    try {
      const response = await fetch('https://ripple-flask-server.onrender.com/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate signature')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Signature generation error:', error)
      throw error
    }
  }

  const uploadToCloudinary = async (file) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = 'ripple-marketplace/messages'
    
    // Parameters for signature
    const params = {
      timestamp,
      folder,
      public_id: `message_${timestamp}_${Math.random().toString(36).substring(7)}`
    }

    try {
      // Get signature from backend
      const { signature, api_key } = await generateSignature(params)
      
      // Prepare form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', api_key)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('public_id', params.public_id)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      return {
        url: data.secure_url,
        publicId: data.public_id,
        originalName: file.name
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file sizes (max 5MB each)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }
    }

    setUploadingImages(true)
    const newPreviews = []
    
    try {
      // Create previews for all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileId = `${Date.now()}-${i}`
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        newPreviews.push({
          id: fileId,
          file,
          previewUrl,
          name: file.name,
          status: 'pending'
        })
        
        // Initialize progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { name: file.name, progress: 0, status: 'uploading' }
        }))
      }
      
      setImagePreviews(newPreviews)
      
      // Upload files one by one
      for (const preview of newPreviews) {
        try {
          // Upload to Cloudinary with signed upload
          const uploadResult = await uploadToCloudinary(preview.file)
          
          // Update progress to complete
          setUploadProgress(prev => ({
            ...prev,
            [preview.id]: { name: preview.name, progress: 100, status: 'completed' }
          }))
          
          // Send message with image
          if (socket && isConnected) {
            socket.emit('send_message', {
              image_url: uploadResult.url
            })
          }
          
          // Update preview status
          setImagePreviews(prev => 
            prev.map(p => 
              p.id === preview.id 
                ? { ...p, status: 'completed', uploadedUrl: uploadResult.url }
                : p
            )
          )
          
        } catch (error) {
          // Update progress to error
          setUploadProgress(prev => ({
            ...prev,
            [preview.id]: { name: preview.name, progress: 0, status: 'error' }
          }))
          
          // Update preview status
          setImagePreviews(prev => 
            prev.map(p => 
              p.id === preview.id 
                ? { ...p, status: 'error' }
                : p
            )
          )
          
          console.error(`Failed to upload ${preview.name}:`, error)
        }
      }
      
      // Clear progress and previews after a delay
      setTimeout(() => {
        setUploadProgress({})
        setImagePreviews([])
        // Clean up preview URLs
        newPreviews.forEach(preview => {
          URL.revokeObjectURL(preview.previewUrl)
        })
      }, 3000)
      
    } catch (error) {
      console.error('Upload process error:', error)
      alert('Failed to process images. Please try again.')
    } finally {
      setUploadingImages(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePreview = (previewId) => {
    setImagePreviews(prev => {
      const preview = prev.find(p => p.id === previewId)
      if (preview) {
        URL.revokeObjectURL(preview.previewUrl)
      }
      return prev.filter(p => p.id !== previewId)
    })
    
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[previewId]
      return newProgress
    })
  }

  const handleReportMessage = (messageId) => {
    if (socket && isConnected) {
      socket.emit('report_message', { message_id: messageId });
      alert('Message reported to administrators');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSwipeStart = (e) => { startY.current = e.touches[0].clientY }
  const handleSwipeMove = (e) => { if (!startY.current) return; const deltaY = e.touches[0].clientY - startY.current; if (deltaY > 100) onClose() }
  const handleSwipeEnd = () => { startY.current = null }

  if (!isOpen || !order) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onTouchStart={handleSwipeStart}
      onTouchMove={handleSwipeMove}
      onTouchEnd={handleSwipeEnd}
    >
      <div ref={modalRef} className="bg-gray-800 rounded-t-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-white font-semibold text-lg truncate">Chat with {order.customer}</h2>
            <p className="text-gray-400 text-sm">
              Order {order.id} - {order.title} | <span className={`font-medium ${connectionStatus==="Connected"?"text-green-400":connectionStatus==="Connecting…"?"text-yellow-400":"text-red-400"}`}>{connectionStatus}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-gray-500 text-center text-sm">No messages yet.</p>}
          {messages.map((msg) => {
            const isOwn = msg.sent_by === userType
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end max-w-[80%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isOwn ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}>{isOwn ? "S" : "B"}</div>
                  <div className={`px-3 py-2 rounded-lg shadow-sm break-words ${isOwn ? "bg-green-600 text-white rounded-br-none" : "bg-gray-700 text-white rounded-bl-none"}`}>
                    {msg.image_url && <img src={msg.image_url} className="max-w-full h-auto rounded-lg cursor-pointer mb-1" onClick={() => window.open(msg.image_url, "_blank")} />}
                    {msg.message && <p className="text-sm">{msg.message}</p>}
                    <div className="flex justify-between items-center text-xs opacity-70 mt-1">
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {!isOwn && <button onClick={() => handleReportMessage(msg.id)} className="hover:text-red-400"><Flag size={12} /></button>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-3 flex items-center gap-2 bg-gray-800/50">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg bg-gray-900 text-white resize-none max-h-[120px]"
          />
          <div className="flex gap-1">
            <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} variant="ghost"><Smile size={16} /></Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" disabled={uploadingImages}><Camera size={16} /></Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || connectionStatus!=="Connected"} className="bg-green-600 hover:bg-green-700 text-white"><Send size={16} /></Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload}/>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-[70px] right-4 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} width={250} height={300} />
          </div>
        )}
      </div>
    </div>
  )
}

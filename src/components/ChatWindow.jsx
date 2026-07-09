import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { notify } from '../lib/notifications'

function ChatWindow({ conversationWith, conversationName, currentUser, orderId, onClose }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Fetch messages
  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000) // Refresh every 2 seconds
    return () => clearInterval(interval)
  }, [conversationWith])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},receiver_id.eq.${currentUser.id})`
      )
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch messages:', error)
    } else {
      setMessages(data || [])
      setLoading(false)
      scrollToBottom()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setSending(true)

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: conversationWith,
      order_id: orderId || null,
      content: inputValue,
    })

    setSending(false)

    if (error) {
      notify.error('Failed to send message')
    } else {
      notify.success('Message sent')
      setInputValue('')
      fetchMessages()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="hidden md:flex flex-col h-full bg-white border-l border-gray-200 rounded-lg"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gradient-to-r from-[#E8F5E9] to-white">
        <div>
          <h3 className="font-[var(--font-heading)] text-lg text-[#1B5E20]">
            {conversationName}
          </h3>
          <p className="text-xs text-gray-500">Active now</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === currentUser.id
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-4 space-y-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 transition-all"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim()}
          className="w-full bg-[#2E7D32] text-white py-2 rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-60 transition-all"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </motion.div>
  )
}

export default ChatWindow
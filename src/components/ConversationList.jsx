import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function ConversationList({ currentUser, onSelectConversation }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [currentUser])

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(name), receiver:receiver_id(name)')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch conversations:', error)
    } else {
      // Group by conversation partner
      const grouped = {}
      data.forEach((msg) => {
        const partnerId =
          msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
        const partnerName =
          msg.sender_id === currentUser.id ? msg.receiver?.name : msg.sender?.name

        if (!grouped[partnerId]) {
          grouped[partnerId] = {
            id: partnerId,
            name: partnerName,
            lastMessage: msg.content,
            lastTime: msg.created_at,
          }
        }
      })

      setConversations(Object.values(grouped))
      setLoading(false)
    }
  }

  return (
    <div className="w-64 border-r border-gray-200 bg-white rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-[#E8F5E9] to-white">
        <h2 className="font-[var(--font-heading)] text-lg text-[#1B5E20]">Messages</h2>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500 text-sm p-4">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="text-center text-gray-500 text-sm p-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id, conv.name)}
              className="w-full text-left border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm text-gray-900">{conv.name}</p>
              <p className="text-xs text-gray-600 mt-1 truncate">{conv.lastMessage}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(conv.lastTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList
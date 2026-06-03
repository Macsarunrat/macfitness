import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Heart, Send, CheckCircle2, UserPlus, Link2, Sparkles, Smile, Users, PlusCircle } from 'lucide-react'

export default function Social() {
  const { user, group, groupMembers, createGroup, joinGroup, leaveGroup } = useStore()
  
  const [newGroupName, setNewGroupName] = useState('')
  const [joinInviteCode, setJoinInviteCode] = useState('')
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Teddy', text: 'วันนี้ใครพร้อมซ้อมบ้างจ๊ะ? 🏃‍♂️', time: '07:30', avatar: '🐻', colorClass: 'bg-purple-100 text-purple-700' },
    { id: 2, sender: 'Kitty', text: 'เค้าพึ่งไปคาดิโอมาจ้า เหนื่อยมากกก 🥵', time: '08:12', avatar: '🐱', colorClass: 'bg-emerald-100 text-emerald-700' },
    { id: 3, sender: 'You', text: 'เค้าพึ่งซัดอกไก่ปั่นไป 🌸 เติมโปรตีนด่วน!', time: '08:45', avatar: '🐰', colorClass: 'bg-pastel-pink-deep text-white' }
  ])
  const [inputText, setInputText] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newGroupName) return
    createGroup(newGroupName)
    setNewGroupName('')
    alert('สร้างกลุ่มสควอดสำเร็จแล้วจ้า! 🎉')
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!joinInviteCode) return
    joinGroup(joinInviteCode)
    setJoinInviteCode('')
    alert('เข้าร่วมสควอดของเพื่อนเรียบร้อยแล้วจ้า! 💖')
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText) return
    
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '🐰',
      colorClass: 'bg-pastel-pink-deep text-white'
    }
    
    setMessages([...messages, newMsg])
    setInputText('')

    // Mock interactive replies from group members
    setTimeout(() => {
      const buddies = [
        { name: 'Teddy', avatar: '🐻', reply: 'สุดยอดดดด! เดี๋ยวเค้ากินตามมั่ง 🍳', color: 'bg-purple-100 text-purple-700' },
        { name: 'Kitty', avatar: '🐱', reply: 'ฟิตกันจังเล๊ยยย เค้าขอพักแพร๊บ 🍰', color: 'bg-emerald-100 text-emerald-700' },
        { name: 'Puppy', avatar: '🐶', reply: 'แวะมาซ้อมด้วยคนน้าาา 🐶💨', color: 'bg-amber-100 text-amber-700' }
      ]
      const luckyBuddy = buddies[Math.floor(Math.random() * buddies.length)]
      
      const replyMsg = {
        id: Date.now() + 1,
        sender: luckyBuddy.name,
        text: luckyBuddy.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: luckyBuddy.avatar,
        colorClass: luckyBuddy.color
      }
      setMessages(prev => [...prev, replyMsg])
    }, 1500)
  }

  const sendQuickSticker = (sticker) => {
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: sticker,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '🐰',
      colorClass: 'bg-pastel-pink-deep text-white'
    }
    setMessages([...messages, newMsg])
    
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'Kitty',
        text: 'รับพลังโปรตีนและหัวใจจากเพื่อนเรียบร้อย! ขอบคุณน้าาา 💖✨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🐱',
        colorClass: 'bg-emerald-100 text-emerald-700'
      }
      setMessages(prev => [...prev, replyMsg])
    }, 1200)
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-pastel-text flex items-center justify-center gap-2">
          <span>👥</span> Squad Social (พื้นที่แก๊งสุดคิวท์)
        </h2>
        <p className="text-sm text-pastel-muted">พื้นที่แชร์ผลการซ้อม โภชนาการ และคุยสัพเพเหระของชาวแก๊ง</p>
      </div>

      {group ? (
        <div className="space-y-6">
          {/* Squad Info Banner */}
          <div className="bg-gradient-to-r from-pastel-pink-soft via-pastel-peach-light to-pastel-purple-light p-5 rounded-cute-lg shadow-cute flex flex-col md:flex-row md:items-center justify-between border border-white text-center md:text-left relative overflow-hidden gap-4">
            <div className="space-y-1 relative z-10">
              <h3 className="font-black text-pastel-text text-lg flex items-center justify-center md:justify-start gap-1">
                <span>🏆</span> {group.name}
              </h3>
              <p className="text-xs text-pastel-muted">
                ชวนเพื่อนเข้าร่วมสควอดด้วยรหัสเชิญ: <strong className="text-pastel-pink-hot font-black select-all bg-white px-2 py-0.5 rounded-full border border-pastel-pink-soft">{group.inviteCode}</strong>
              </p>
            </div>

            {/* List avatars */}
            <div className="flex items-center justify-center -space-x-2 relative z-10 shrink-0">
              <div className="w-9 h-9 rounded-full bg-pastel-pink-DEFAULT text-white flex items-center justify-center border-2 border-white shadow-cute-sm text-sm font-bold">🐰</div>
              {groupMembers.map((member) => (
                <div key={member.id} className="w-9 h-9 rounded-full bg-pastel-purple text-white flex items-center justify-center border-2 border-white shadow-cute-sm text-sm font-bold">
                  {member.avatar || '🐱'}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full bg-white/80 text-pastel-pink-deep border-dashed border border-pastel-pink-soft text-xs flex items-center justify-center font-bold">+{groupMembers.length + 1}</div>
            </div>
          </div>

          {/* Quick Stickers */}
          <div className="cute-card space-y-3 bg-white/80">
            <h3 className="text-xs font-bold text-pastel-text flex items-center gap-1.5">
              <Smile size={16} className="text-pastel-pink-deep" />
              <span>ส่งห้องแชทด่วน (Quick Broadcast)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'กินข้าวกันด้วยน้าทุกคน 🥗',
                'ปะ ไปวิ่งกันเถอะ! 🏃‍♀️💨',
                'อัปเดตโปรตีนด่วนจ้า 🍳',
                'วันนี้ใครซ้อมบ้างยกมือขึ้น 🙋‍♀️',
                'ส่งความรักให้แก๊งคนเก่ง 💖'
              ].map((sticker, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuickSticker(sticker)}
                  className="text-xs bg-pastel-pink-soft/30 hover:bg-pastel-pink-soft/80 border border-pastel-pink-soft/50 px-3 py-2 rounded-cute transition-colors font-medium text-pastel-text"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>

          {/* Squad Chatroom */}
          <div className="cute-card flex flex-col h-[380px] bg-white/95 border border-pastel-pink-soft/20 shadow-cute">
            <div className="border-b border-pastel-pink-soft/20 pb-3 flex justify-between items-center shrink-0">
              <span className="font-bold text-pastel-text flex items-center gap-1.5">
                💬 แชทห้องแต่งตัวแก๊ง
              </span>
              <button 
                onClick={leaveGroup}
                className="text-[10px] text-pastel-muted hover:text-red-400 font-bold"
              >
                ออกจากกลุ่มสควอด
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm">
              {messages.map((msg) => {
                const isMe = msg.sender === 'You'
                return (
                  <div key={msg.id} className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-white border border-pastel-pink-soft flex items-center justify-center shadow-cute-sm text-sm shrink-0">
                      {msg.avatar}
                    </div>

                    <div className="space-y-0.5 max-w-[75%]">
                      <div className={`text-[10px] font-bold text-pastel-muted ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.sender}
                      </div>
                      <div className={`p-3 rounded-cute ${
                        isMe 
                          ? 'bg-pastel-pink-deep text-white rounded-tr-none' 
                          : 'bg-pastel-purple/50 text-pastel-text rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`text-[9px] text-pastel-muted/70 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-pastel-pink-soft/20 shrink-0">
              <input 
                type="text" 
                placeholder="พิมพ์ส่งข้อความในกลุ่ม..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="cute-input py-2 flex-1" 
              />
              <button 
                type="submit" 
                className="p-3 bg-pastel-pink-deep hover:bg-pastel-pink-hot active:scale-95 text-white rounded-full transition-all duration-200"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Invite / Join / Create panels */
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          {/* Join Squad Card */}
          <div className="cute-card space-y-4 bg-white/90">
            <div className="text-center space-y-1.5 pb-2 border-b border-pastel-pink-soft/10">
              <div className="w-12 h-12 bg-pastel-purple/40 text-pastel-pink-deep rounded-full flex items-center justify-center mx-auto text-lg">
                🔗
              </div>
              <h3 className="font-bold text-pastel-text">เข้าร่วมกลุ่มเพื่อน (Join Squad)</h3>
              <p className="text-xs text-pastel-muted">ใส่รหัสเชิญชวนของแก๊งเพื่อนเพื่อเข้าสู่กลุ่มทันที</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-3">
              <input 
                type="text" 
                placeholder="เช่น PINK-FIT-SQUAD" 
                value={joinInviteCode}
                onChange={e => setJoinInviteCode(e.target.value)}
                className="cute-input text-center font-bold tracking-wider" 
                required
              />
              <button 
                type="submit" 
                className="cute-button-primary w-full py-2.5"
              >
                เข้าร่วมสควอด
              </button>
            </form>
          </div>

          {/* Create Squad Card */}
          <div className="cute-card space-y-4 bg-white/90">
            <div className="text-center space-y-1.5 pb-2 border-b border-pastel-pink-soft/10">
              <div className="w-12 h-12 bg-pastel-pink-soft/40 text-pastel-pink-deep rounded-full flex items-center justify-center mx-auto">
                <PlusCircle size={22} />
              </div>
              <h3 className="font-bold text-pastel-text">สร้างกลุ่มใหม่ (Create Squad)</h3>
              <p className="text-xs text-pastel-muted">ตั้งชื่อกลุ่มใหม่เพื่อเชิญเพื่อนมาร่วมฟิตไปด้วยกัน</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <input 
                type="text" 
                placeholder="เช่น แก๊งสโลว์ไลฟ์วิ่งพาสเทล 🐢" 
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="cute-input text-center" 
                required
              />
              <button 
                type="submit" 
                className="cute-button-secondary w-full py-2.5 border border-pastel-pink-soft"
              >
                ตั้งค่าและรับรหัสชวนเพื่อน
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

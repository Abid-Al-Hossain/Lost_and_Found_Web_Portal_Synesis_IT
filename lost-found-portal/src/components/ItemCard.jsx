// src/components/ItemCard.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MiniMap from './MiniMap'
import { useAuth } from '../context/AuthContext'
import { useSignalRChat } from '../context/SignalRChatContext'
import { base_url } from '../Setup.js'

export default function ItemCard({ item, type }) {
  const { user } = useAuth()
  const {
    initiateChat,
    connectionStatus = 'Disconnected',
    backendUserId
  } = useSignalRChat()
  const navigate = useNavigate()

  const [isInitiating, setIsInitiating] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const currentUserId =
    (user?.backendId && String(user.backendId)) ||
    (backendUserId && String(backendUserId)) ||
    (user?.id && String(user.id)) ||
    (user?.email && String(user.email)) ||
    null

  const ownerId = item?.ownerId ? String(item.ownerId) : null
  const isMine =
    currentUserId && ownerId
      ? String(currentUserId) === String(ownerId)
      : false

  console.log('ItemCard Debug:', {
    currentUserId,
    ownerId,
    isMine,
    itemType: item?.type,
    userBackendId: user?.backendId,
    signalRBackendId: backendUserId
  })


  const showCustomAlert = message => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const handleResolve = async () => {
    if (!user?.accessToken || !item?.id || isResolving) return

    setIsResolving(true)
    const isCurrentlyPending = item.status?.toLowerCase() === 'pending'
    const isLostItem = type === 'lost'
    const postIdParam = 'lostPostId'
    const endpoint = isCurrentlyPending 
      ? (isLostItem ? 'ResolveLostPost' : 'ResolveFoundPost')
      : (isLostItem ? 'PendingLostPost' : 'PendingFoundPost')
    
    try {
      const response = await fetch(`${base_url}/LostAndFound/${endpoint}?${postIdParam}=${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        item.status = isCurrentlyPending ? 'Resolved' : 'Pending'
        showCustomAlert(`${isLostItem ? 'Lost' : 'Found'} post ${isCurrentlyPending ? 'resolved' : 'marked as pending'} successfully!`)
      } else {
        throw new Error(`Failed to ${isCurrentlyPending ? 'resolve' : 'unresolve'} post: ${response.status}`)
      }
    } catch (error) {
      console.error('Resolve error:', error)
      showCustomAlert(`Failed to ${isCurrentlyPending ? 'resolve' : 'unresolve'} post. Please try again.`)
    } finally {
      setIsResolving(false)
    }
  }

  const handleInitiateChat = async () => {
    if (!user?.accessToken || !item?.ownerId || !item?.ownerName) {
      showCustomAlert(
        'Unable to start chat: missing user information'
      )
      return
    }

    if (isMine) {
      showCustomAlert("You can't chat with yourself")
      return
    }

    setIsInitiating(true)

    try {
      if (
        connectionStatus === 'Connected' &&
        typeof initiateChat === 'function'
      ) {
        try {
          const threadName = item.ownerName || 'Unknown User'
          const threadId = await initiateChat(
            item.ownerId,
            threadName
          )

          if (threadId) {
            navigate(`/inbox?t=${threadId}`)
            return
          }
        } catch (signalRError) {
          console.warn(
            'SignalR initiateChat failed, falling back to HTTP',
            signalRError
          )
        }
      }

      const threadName = item.ownerName || 'Unknown User'
      const payload = {
        receiverId: item.ownerId,
        senderName: user.name || user.email || '',
        receiverName: item.ownerName || '',
        ThreadName: threadName,
        threadName,
        title: threadName,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        itemId: item.id,
        itemType: item.type
      }

      const response = await fetch(
        `${base_url}/ChatBox/InitiatChatThread`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`
          },
          body: JSON.stringify(payload)
        }
      )

      if (response.ok) {
        navigate('/inbox')
      } else if (response.status === 400) {
        try {
          const errorData = await response.json()
          if (errorData.errors) {
            const errorMessages = Object.values(
              errorData.errors
            ).flat()
            showCustomAlert(
              `Validation Error: ${errorMessages.join(', ')}`
            )
          } else {
            showCustomAlert(
              errorData.title ||
                errorData.message ||
                "Validation failed"
            )
          }
        } catch {
          const errorText = await response.text()
          showCustomAlert(
            errorText || "You can't chat with yourself"
          )
        }
      } else {
        throw new Error(
          `Failed to initiate chat: ${response.status}`
        )
      }
    } catch (error) {
      console.error(error)
      showCustomAlert('Failed to initiate chat. Please try again.')
    } finally {
      setIsInitiating(false)
    }
  }

  return (
    <>
      <motion.div
        className="panel"
        style={{ padding: 16 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <strong>{item.type}</strong>
            <span className="badge">{item.status}</span>
          </div>

          {isMine ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontStyle: 'italic'
                }}
              >
                Your post
              </div>
              <button
                className="btn"
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  background: item.status?.toLowerCase() === 'pending' ? 'var(--success)' : 'var(--warning)',
                  color: 'white',
                  opacity: isResolving ? 0.7 : 1
                }}
                onClick={handleResolve}
                disabled={isResolving}
                title={item.status?.toLowerCase() === 'pending' ? 'Mark this item as resolved' : 'Mark this item as pending'}
              >
                {isResolving ? 'Processing...' : (item.status?.toLowerCase() === 'pending' ? 'Resolve' : 'Unresolve')}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontStyle: 'italic'
                }}
              >
                Contact: {item.ownerName || 'Owner'}
              </div>
              <button
                className="btn"
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  background:
                    connectionStatus === 'Connected'
                      ? 'var(--accent)'
                      : connectionStatus === 'Connecting' ||
                        connectionStatus === 'Reconnecting'
                      ? 'var(--warning)'
                      : 'var(--muted)',
                  opacity: isInitiating ? 0.7 : 1
                }}
                onClick={handleInitiateChat}
                disabled={isInitiating}
                title={
                  connectionStatus === 'Connected'
                    ? 'Start a chat conversation (SignalR real-time)'
                    : connectionStatus === 'Connecting'
                    ? 'Connecting to chat server...'
                    : connectionStatus === 'Reconnecting'
                    ? 'Reconnecting to chat server...'
                    : 'Start a chat conversation (HTTP fallback)'
                }
              >
                {isInitiating ? 'Starting...' : 'Chat'}
                {connectionStatus === 'Connected' && (
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 4
                    }}
                  >
                    ⚡
                  </span>
                )}
                {(connectionStatus === 'Connecting' ||
                  connectionStatus === 'Reconnecting') && (
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 4
                    }}
                  >
                    🔄
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {item.photo && (
          <div className="mt-3">
            <img
              src={item.photo}
              alt={`${item.type} photo`}
              className="item-photo"
            />
          </div>
        )}

        <div
          className="mt-2"
          style={{ color: 'var(--muted)' }}
        >
          {item.brand && (
            <span>
              <b>Brand:</b> {item.brand} &nbsp;
            </span>
          )}
          {item.color && (
            <span>
              <b>Color:</b> {item.color} &nbsp;
            </span>
          )}
          {item.place && (
            <span>
              <b>Place:</b> {item.place} &nbsp;
            </span>
          )}
          {item.date && (
            <span>
              <b>Date:</b>{' '}
              {new Date(item.date).toLocaleDateString('en-GB')}
            </span>
          )}
        </div>

        {item.location && (
          <div className="mt-3">
            <MiniMap location={item.location} />
          </div>
        )}
      </motion.div>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={closeAlert}
          >
            <motion.div
              initial={{ scale: 0.8, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -20 }}
              style={{
                background: 'var(--panel)',
                borderRadius: 16,
                padding: 24,
                maxWidth: 400,
                width: '90%',
                boxShadow:
                  '0 20px 40px rgba(0, 0, 0, 0.1)',
                border:
                  '1px solid color-mix(in hsl, var(--panel), #000 10%)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      'color-mix(in hsl, #ff6b6b, #fff 85%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}
                >
                  ⚠️
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600
                    }}
                  >
                    Chat / Action Notice
                  </h3>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  marginBottom: 20,
                  color: 'var(--muted)',
                  lineHeight: 1.5
                }}
              >
                {alertMessage}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8
                }}
              >
                <button
                  className="btn ghost"
                  onClick={closeAlert}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={closeAlert}
                  style={{ padding: '8px 16px' }}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

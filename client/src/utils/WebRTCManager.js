import SimplePeer from 'simple-peer';

class WebRTCManager {
  constructor(socket, store) {
    this.socket = socket;
    this.store = store;
    this.peers = new Map(); // userId -> SimplePeer instance
    this.localStream = null;
    this.setupSocketListeners();
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        }
      });
      
      this.store.getState().setLocalStream(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Microphone access denied. Please allow microphone access to join voice channels.');
    }
  }

  createPeerConnection(userId, initiator = false) {
    if (this.peers.has(userId)) {
      this.peers.get(userId).destroy();
    }

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.setupPeerListeners(peer, userId);
    this.peers.set(userId, peer);
    return peer;
  }

  setupPeerListeners(peer, userId) {
    peer.on('signal', (data) => {
      const { currentVoiceChannel } = this.store.getState();
      if (currentVoiceChannel) {
        this.socket.emit('webrtc-offer', {
          targetUserId: userId,
          offer: data,
          channelId: currentVoiceChannel._id
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      this.handleRemoteStream(userId, remoteStream);
    });

    peer.on('error', (err) => {
      console.error(`Peer connection error with user ${userId}:`, err);
      this.peers.delete(userId);
    });

    peer.on('close', () => {
      console.log(`Peer connection closed with user ${userId}`);
      this.peers.delete(userId);
    });
  }

  handleRemoteStream(userId, remoteStream) {
    // Create audio element for remote stream
    const audio = document.createElement('audio');
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.id = `voice-${userId}`;
    
    // Remove existing audio element if exists
    const existingAudio = document.getElementById(`voice-${userId}`);
    if (existingAudio) {
      existingAudio.remove();
    }
    
    // Add to DOM (hidden)
    audio.style.display = 'none';
    document.body.appendChild(audio);
    
    console.log(`Receiving audio stream from user ${userId}`);
  }

  setupSocketListeners() {
    this.socket.on('webrtc-offer', ({ fromUserId, offer, channelId }) => {
      const { currentVoiceChannel } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        const peer = this.createPeerConnection(fromUserId, false);
        peer.signal(offer);
      }
    });

    this.socket.on('webrtc-answer', ({ fromUserId, answer, channelId }) => {
      const { currentVoiceChannel } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        const peer = this.peers.get(fromUserId);
        if (peer) {
          peer.signal(answer);
        }
      }
    });

    this.socket.on('webrtc-ice-candidate', ({ fromUserId, candidate, channelId }) => {
      const { currentVoiceChannel } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        const peer = this.peers.get(fromUserId);
        if (peer) {
          peer.signal(candidate);
        }
      }
    });

    this.socket.on('user-joined-voice', ({ userId, channelId }) => {
      const { currentVoiceChannel, addVoiceUser } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        // Create peer connection as initiator
        this.createPeerConnection(userId, true);
        
        // Add user to voice users list
        addVoiceUser({
          userId: { _id: userId },
          muted: false,
          deafened: false
        });
      }
    });

    this.socket.on('user-left-voice', ({ userId, channelId }) => {
      const { currentVoiceChannel, removeVoiceUser } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        // Clean up peer connection
        const peer = this.peers.get(userId);
        if (peer) {
          peer.destroy();
          this.peers.delete(userId);
        }
        
        // Remove audio element
        const audio = document.getElementById(`voice-${userId}`);
        if (audio) {
          audio.remove();
        }
        
        // Remove user from voice users list
        removeVoiceUser(userId);
      }
    });

    this.socket.on('voice-state-changed', ({ userId, muted, deafened }) => {
      const { updateVoiceUser } = this.store.getState();
      updateVoiceUser(userId, { muted, deafened });
    });

    this.socket.on('voice-users-list', ({ channelId, users }) => {
      const { currentVoiceChannel, setVoiceUsers } = this.store.getState();
      if (currentVoiceChannel && currentVoiceChannel._id === channelId) {
        const voiceUsers = users.map(userId => ({
          userId: { _id: userId },
          muted: false,
          deafened: false
        }));
        setVoiceUsers(voiceUsers);
        
        // Create peer connections for existing users
        users.forEach(userId => {
          if (userId !== this.socket.id) {
            this.createPeerConnection(userId, true);
          }
        });
      }
    });
  }

  cleanup() {
    // Destroy all peer connections
    for (const [userId, peer] of this.peers.entries()) {
      peer.destroy();
      
      // Remove audio elements
      const audio = document.getElementById(`voice-${userId}`);
      if (audio) {
        audio.remove();
      }
    }
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  muteMicrophone(muted) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
  }

  setVolume(userId, volume) {
    const audio = document.getElementById(`voice-${userId}`);
    if (audio) {
      audio.volume = volume;
    }
  }
}

let webRTCManager = null;

export const initializeWebRTC = (socket, store) => {
  if (webRTCManager) {
    webRTCManager.cleanup();
  }
  webRTCManager = new WebRTCManager(socket, store);
  return webRTCManager;
};

export const getWebRTCManager = () => webRTCManager;

export default WebRTCManager;

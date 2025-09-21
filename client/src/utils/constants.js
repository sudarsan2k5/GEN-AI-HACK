
// Smart HOST detection based on current location
const getServerURL = () => {
  const currentHost = window.location.hostname;
  
  // If accessing from network IP, use network IP for server
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8747`;
  }
  
  // Default to localhost for local development
  return import.meta.env.VITE_SERVER_URL || "http://localhost:8747";
};

export const HOST = getServerURL();

export const AUTH_ROUTES= "api/auth";
export const SIGNUP_ROUTE=`${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE=`${AUTH_ROUTES}/login`;
export const GET_USER_INFO=`${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE =`${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE =`${AUTH_ROUTES}/add-profile-image`;
export const LOGOUT_ROUTE=`${AUTH_ROUTES}/logout`;


export const CONTACTS_ROUTES = "/api/contacts";
export const SEARCH_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/search`;

export const GET_DM_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/get-all-contacts`;


export const MESSAGES_ROUTES = "api/messages";
export const GET_ALL_MESSAGES_ROUTE = `${MESSAGES_ROUTES}/get-messages`;


export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/upload-file`;

export const CHANNEL_ROUTES = `api/channel`;
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/get-user-channels`;

export const VOICE_CHANNEL_ROUTES = `api/voice`;
export const CREATE_VOICE_CHANNEL_ROUTE = `${VOICE_CHANNEL_ROUTES}/create-voice-channel`;
export const GET_USER_VOICE_CHANNELS_ROUTE = `${VOICE_CHANNEL_ROUTES}/get-user-voice-channels`;
export const JOIN_VOICE_CHANNEL_ROUTE = `${VOICE_CHANNEL_ROUTES}/join`;
export const LEAVE_VOICE_CHANNEL_ROUTE = `${VOICE_CHANNEL_ROUTES}/leave`;
export const UPDATE_VOICE_STATE_ROUTE = `${VOICE_CHANNEL_ROUTES}/voice-state`;
export const GET_VOICE_CHANNEL_USERS_ROUTE = `${VOICE_CHANNEL_ROUTES}/users`;

export const AI_CHAT_ROUTES = `api/ai-chat`;
export const SEND_AI_MESSAGE_ROUTE = `${AI_CHAT_ROUTES}/message`;
export const GET_AI_CHAT_HISTORY_ROUTE = `${AI_CHAT_ROUTES}/history`;
export const CLEAR_AI_CHAT_HISTORY_ROUTE = `${AI_CHAT_ROUTES}/history`;

export const POSTS_ROUTES = `api/posts`;
export const CREATE_POST_ROUTE = `${POSTS_ROUTES}`;
export const GET_ALL_POSTS_ROUTE = `${POSTS_ROUTES}`;
export const LIKE_POST_ROUTE = `${POSTS_ROUTES}`;
export const COMMENT_POST_ROUTE = `${POSTS_ROUTES}`;
export const DELETE_POST_ROUTE = `${POSTS_ROUTES}`;
export const GET_USER_POSTS_ROUTE = `${POSTS_ROUTES}/user`;

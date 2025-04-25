// socketManager.js
// A simple module to manage socket-to-user mappings

// Store userId -> socketId mappings
const userSocketMap = new Map();

/**
 * Set a user's socket ID
 * @param {string} userId - The user ID
 * @param {string} socketId - The socket ID
 */
function setSocketId(userId, socketId) {
  if (!userId || !socketId) return false;
  userSocketMap.set(userId.toString(), socketId);
  return true;
}

/**
 * Get a user's socket ID
 * @param {string} userId - The user ID
 * @returns {string|null} - The socket ID or null if not found
 */
function getSocketId(userId) {
  if (!userId) return null;
  return userSocketMap.get(userId.toString()) || null;
}

/**
 * Remove a socket mapping by user ID
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the removal was successful
 */
function removeSocketByUserId(userId) {
  if (!userId) return false;
  return userSocketMap.delete(userId.toString());
}

/**
 * Remove a socket mapping by socket ID
 * @param {string} socketId - The socket ID
 * @returns {boolean} - Whether the removal was successful
 */
function removeSocketBySocketId(socketId) {
  if (!socketId) return false;
  
  for (const [userId, id] of userSocketMap.entries()) {
    if (id === socketId) {
      userSocketMap.delete(userId);
      return true;
    }
  }
  return false;
}

/**
 * Get all socket mappings for debugging
 * @returns {Array} - Array of [userId, socketId] pairs
 */
function getAllMappings() {
  return Array.from(userSocketMap.entries());
}

module.exports = {
  setSocketId,
  getSocketId,
  removeSocketByUserId,
  removeSocketBySocketId,
  getAllMappings
};
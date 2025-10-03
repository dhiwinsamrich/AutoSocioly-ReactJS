// Network Configuration
// Update this file to switch between localhost and network access

export const NETWORK_CONFIG = {
  // Your machine's IP address (update this if your IP changes)
  MACHINE_IP: '192.168.1.2',
  
  // Backend port
  BACKEND_PORT: 8000,
  
  // Frontend port
  FRONTEND_PORT: 8080,
  
  // Use network IP instead of localhost for network access
  USE_NETWORK_IP: false,
};

// Generate API URL based on configuration
export const getApiUrl = (): string => {
  const host = NETWORK_CONFIG.USE_NETWORK_IP ? NETWORK_CONFIG.MACHINE_IP : 'localhost';
  return `http://${host}:${NETWORK_CONFIG.BACKEND_PORT}`;
};

// Generate frontend URL for sharing
export const getFrontendUrl = (): string => {
  const host = NETWORK_CONFIG.USE_NETWORK_IP ? NETWORK_CONFIG.MACHINE_IP : 'localhost';
  return `http://${host}:${NETWORK_CONFIG.FRONTEND_PORT}`;
};

// Instructions for network access:
// 1. Set USE_NETWORK_IP to true (already done)
// 2. Update MACHINE_IP if your IP address changes
// 3. Share the frontend URL with other devices on your network
// 4. Make sure Windows Firewall allows connections on ports 8000 and 8080

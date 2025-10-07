// Network Configuration
// Update this file to switch between localhost, network access, and tunnel access

export const NETWORK_CONFIG = {
  // Your server's IP address (update this if your IP changes)
  MACHINE_IP: '148.113.16.40',
  
  // Backend port
  BACKEND_PORT: 8023,
  
  // Frontend port
  FRONTEND_PORT: 3183,
  
  // Localtunnel URL for public access
  TUNNEL_URL: 'https://poor-chairs-watch.loca.lt',
  
  // Connection mode: 'localhost', 'network', or 'tunnel'
  CONNECTION_MODE: 'network',
};

// Generate API URL based on configuration
export const getApiUrl = (): string => {
  switch (NETWORK_CONFIG.CONNECTION_MODE) {
    case 'tunnel':
      return NETWORK_CONFIG.TUNNEL_URL;
    case 'network':
      return `http://${NETWORK_CONFIG.MACHINE_IP}:${NETWORK_CONFIG.BACKEND_PORT}`;
    case 'localhost':
    default:
      return `http://localhost:${NETWORK_CONFIG.BACKEND_PORT}`;
  }
};

// Generate frontend URL for sharing
export const getFrontendUrl = (): string => {
  switch (NETWORK_CONFIG.CONNECTION_MODE) {
    case 'tunnel':
      // For tunnel mode, frontend is typically served locally
      return `http://localhost:${NETWORK_CONFIG.FRONTEND_PORT}`;
    case 'network':
      return `http://${NETWORK_CONFIG.MACHINE_IP}:${NETWORK_CONFIG.FRONTEND_PORT}`;
    case 'localhost':
    default:
      return `http://localhost:${NETWORK_CONFIG.FRONTEND_PORT}`;
  }
};

// Instructions for different connection modes:
// 1. TUNNEL MODE: Set CONNECTION_MODE to 'tunnel' and update TUNNEL_URL
//    - Frontend runs locally, backend accessible via tunnel
//    - Best for development and testing with external access
// 2. NETWORK MODE: Set CONNECTION_MODE to 'network' and update MACHINE_IP
//    - Both frontend and backend accessible on local network
//    - Make sure Windows Firewall allows connections on ports 8000 and 8080
// 3. LOCALHOST MODE: Set CONNECTION_MODE to 'localhost' (default)
//    - Both frontend and backend run locally
//    - Best for local development only

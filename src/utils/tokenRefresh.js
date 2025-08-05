// Utility functions for token refresh testing và debugging

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const getTimeUntilExpiration = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return null;
  
  const currentTime = new Date();
  const timeUntilExpiration = expirationTime.getTime() - currentTime.getTime();
  
  return Math.max(0, timeUntilExpiration);
};

export const shouldRefreshToken = (token, refreshThresholdMinutes = 5) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (!timeUntilExpiration) return true;
  
  const thresholdMs = refreshThresholdMinutes * 60 * 1000;
  return timeUntilExpiration <= thresholdMs;
};

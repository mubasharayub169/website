// Vercel Speed Insights initialization
// This script loads the Speed Insights tracker for performance monitoring

(function() {
  // Initialize the queue for Speed Insights
  if (window.si) return;
  
  window.si = function() {
    (window.siq = window.siq || []).push(arguments);
  };

  // Detect if we're in development mode
  const isDevelopment = () => {
    try {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname.includes('192.168.');
    } catch (e) {
      return false;
    }
  };

  // Load the Speed Insights script
  const script = document.createElement('script');
  script.src = isDevelopment() 
    ? 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js'
    : '/_vercel/speed-insights/script.js';
  script.defer = true;
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '1.3.1';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if any content blockers are enabled.');
  };
  
  document.head.appendChild(script);
})();

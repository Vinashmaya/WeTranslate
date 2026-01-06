javascript:(function() {
  /* 
   * CRM Polyglot Bookmarklet Loader 
   * 
   * Instructions:
   * 1. Host the build output (index.js / main.js) on a server (e.g., localhost or a CDN).
   * 2. Update the SCRIPT_URL variable below to point to that file.
   * 3. Minify this code or copy it into a browser bookmark.
   */

  const SCRIPT_URL = 'http://localhost:8080/index.js'; // Replace with your actual hosted script URL
  const TAILWIND_URL = 'https://cdn.tailwindcss.com';

  // 1. Inject Tailwind CSS if not present
  if (!document.querySelector(`script[src="${TAILWIND_URL}"]`)) {
    const twScript = document.createElement('script');
    twScript.src = TAILWIND_URL;
    document.head.appendChild(twScript);
  }

  // 2. Inject React App Bundle
  // Prevents multiple injections
  if (!document.getElementById('crm-polyglot-script')) {
    const appScript = document.createElement('script');
    appScript.id = 'crm-polyglot-script';
    appScript.src = SCRIPT_URL;
    appScript.type = 'module'; 
    appScript.onload = () => console.log('CRM Polyglot Loaded');
    appScript.onerror = () => alert('Failed to load CRM Polyglot. Check console.');
    document.body.appendChild(appScript);
  } else {
    console.log('CRM Polyglot already loaded.');
  }
})();
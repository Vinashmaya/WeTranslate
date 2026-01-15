javascript:(function() {
  /* 
   * CRM Polyglot Bookmarklet Loader 
   * 
   * Instructions:
   * 1. Run `npm run build` to generate `dist/widget.js`.
   * 2. Upload `dist/widget.js` to a server.
   * 3. Update SCRIPT_URL below.
   */

  const SCRIPT_URL = 'http://localhost:8080/dist/widget.js'; // Change this to your uploaded file URL
  const TAILWIND_URL = 'https://cdn.tailwindcss.com';

  // 1. Inject Tailwind CSS
  // Note: Some websites may block this via CSP. 
  // For a production robust version, you should compile Tailwind into widget.js css.
  if (!document.querySelector(`script[src="${TAILWIND_URL}"]`)) {
    const twScript = document.createElement('script');
    twScript.src = TAILWIND_URL;
    document.head.appendChild(twScript);
  }

  // 2. Inject Widget Bundle
  if (!document.getElementById('crm-polyglot-script')) {
    const appScript = document.createElement('script');
    appScript.id = 'crm-polyglot-script';
    appScript.src = SCRIPT_URL;
    appScript.onload = () => console.log('CRM Polyglot Loaded');
    appScript.onerror = () => alert('Failed to load CRM Polyglot widget. Is the server running?');
    document.body.appendChild(appScript);
  } else {
    console.log('CRM Polyglot already loaded.');
  }
})();
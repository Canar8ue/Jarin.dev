/* Template for ai-key.js — copy this file to ai-key.js and paste your key.
   ai-key.js is gitignored so the real key never reaches GitHub.
   Dual-mode: the browser fallback path seals it in a closure; server.js
   requires it for the grading proxy. Without ai-key.js:
   - "node server.js" prints setup instructions and exits
   - opening index.html directly still works, but "Grade with AI"
     reports the grader is not configured */
if (typeof window !== "undefined") {
  const KEY = "YOUR_ZAI_API_KEY_HERE";
  window.CLP_GRADE = async function(url, body, timeoutMs){
    const ctl = new AbortController();
    const timer = setTimeout(function(){ ctl.abort(); }, timeoutMs || 75000);
    let resp;
    try{
      resp = await fetch(url, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + KEY },
        signal:ctl.signal,
        body:JSON.stringify(body)
      });
    } finally { clearTimeout(timer); }
    if(!resp.ok){
      let msg = "HTTP " + resp.status;
      try{ const j = await resp.json(); if(j.error && j.error.message) msg = j.error.message; }catch(e){}
      throw new Error(msg);
    }
    return resp.json();
  };
} else if (typeof module !== "undefined" && module.exports) {
  module.exports = "YOUR_ZAI_API_KEY_HERE";
}

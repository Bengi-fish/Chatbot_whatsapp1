const API_URL = 'http://localhost:3009/api'
async function login(){
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const err = document.getElementById('err')
  err.textContent = ''
  try {
    const res = await fetch(`${API_URL}/auth/login`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email,password})
    })
    const json = await res.json()
    if(!json.success) return err.textContent = json.error || 'Error'
    localStorage.setItem('dash_token', json.token)
    window.location.href = `/?token=${encodeURIComponent(json.token)}`
  } catch(e){
    err.textContent = 'Error de red'
  }
}
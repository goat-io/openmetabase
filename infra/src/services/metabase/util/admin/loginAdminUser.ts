interface LoginResponse {
  id: string
}

// Retrieve session token for admin user
export async function loginAdminUser({
  userName,
  password,
  baseUrl,
}: {
  userName: string
  password: string
  baseUrl: string
}) {
  console.log('🔑 Logging in as admin...')

  const loginRes = await fetch(`${baseUrl}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userName,
      password: password,
    }),
  })

  if (loginRes.ok) {
    const loginData = (await loginRes.json()) as LoginResponse
    console.log('✅ Admin login successful!')
    return loginData.id
  } else {
    console.error('❌ Admin login failed:', await loginRes.text())
    process.exit(1)
  }
}

import { loginAdminUser } from './loginAdminUser'

interface SessionPropertiesResponse {
  'setup-token': string
  [key: string]: string | boolean | number
}

interface SetupResponse {
  id: string
}

export async function createAdminUser({
  userName,
  password,
  baseUrl,
}: {
  userName: string
  password: string
  baseUrl: string
}) {
  console.log('🔑 Logging in as admin...')

  // Get setup token
  const propertiesRes = await fetch(`${baseUrl}/api/session/properties`)
  const properties = (await propertiesRes.json()) as SessionPropertiesResponse
  const setupToken = properties['setup-token']

  // Create admin user
  const setupRes = await fetch(`${baseUrl}/api/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: setupToken,
      user: {
        email: userName,
        first_name: 'Metabase',
        last_name: 'Admin',
        password: password,
      },
      prefs: {
        allow_tracking: false,
        site_name: 'Metawhat',
      },
    }),
  })

  if (setupRes.status === 403) {
    console.log('Admin user was already created')
    return await loginAdminUser({ userName, password, baseUrl })
  }

  const setupData = (await setupRes.json()) as SetupResponse

  const mbToken = setupData.id

  //   console.log('\n👥 Creating some basic users...')

  //   for (const user of users) {
  //     await fetch(`${METABASE_URL}/api/user`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-Metabase-Session': mbToken,
  //       },
  //       body: JSON.stringify({
  //         first_name: user.first_name,
  //         last_name: user.last_name,
  //         email: user.email,
  //         login_attributes: { region_filter: user.region },
  //         password: ADMIN_PASSWORD,
  //       }),
  //     })
  //   }

  //   console.log('✅ Basic users created!')

  return mbToken
}

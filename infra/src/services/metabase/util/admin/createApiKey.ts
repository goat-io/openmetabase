interface ApiKeyResponse {
  created_at: string
  updated_at: string,
  id: 1,
  group: { name: string, id: number },
  unmasked_key: string,
  name: string,
  masked_key: string
}

// Create an API key for Metabase
export async function createApiKey({
  baseUrl,
  mbToken,
  keyName = 'Pulumi Generated API Key',
  groupId = 1,
}: {
  baseUrl: string
  mbToken: string
  keyName?: string
  groupId: number | null,
}) {
  console.log('🔑 Creating Metabase API key...')

  const response = await fetch(`${baseUrl}/api/api-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
    body: JSON.stringify({
      name: keyName,
      group_id: groupId,
    }),
  })

  if (response.ok) {
    const res = await response.json()
    return res as ApiKeyResponse
  } else {
    const errorText = await response.text()
    console.error('❌ API key creation failed:', errorText)
    throw new Error(`Failed to create API key: ${errorText}`)
  }
}
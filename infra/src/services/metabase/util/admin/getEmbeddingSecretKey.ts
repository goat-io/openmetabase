// Fetch the embedding secret key from Metabase
export async function getEmbeddingSecretKey({
  baseUrl,
  mbToken,
}: {
  baseUrl: string
  mbToken: string
}) {
  console.log('🔐 Fetching embedding secret key...')

  const response = await fetch(`${baseUrl}/api/setting/embedding-secret-key`, {
    method: 'GET',
    headers: {
      'X-Metabase-Session': mbToken,
    },
  })

  if (response.ok) {
    let embeddingSecretKey = await response.text()
    // Remove quotes if the response is a JSON string
    embeddingSecretKey = embeddingSecretKey.replace(/^"|"$/g, '')
    console.log('✅ Embedding secret key retrieved successfully!')
    return embeddingSecretKey
  } else {
    const errorText = await response.text()
    console.error('❌ Failed to fetch embedding secret key:', errorText)
    throw new Error(`Failed to fetch embedding secret key: ${errorText}`)
  }
}
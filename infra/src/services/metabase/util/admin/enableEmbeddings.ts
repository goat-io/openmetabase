// Add MySQL Database source
export async function enableEmbeddings({
  baseUrl,
  mbToken,
}: {
  baseUrl: string
  mbToken: string
}) {
  // Create database if not found
  const createResponse = await fetch(
    `${baseUrl}/api/setting/enable-embedding-static`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': mbToken,
      },
      body: JSON.stringify({
        value: true,
      }),
    },
  )
}

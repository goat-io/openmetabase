// Add MySQL Database source
export async function enableActionsInDatasource({
  baseUrl,
  mbToken,
  dbId,
}: {
  baseUrl: string
  mbToken: string
  dbId: number
}) {
  // Create database if not found
  const enableResponse = await fetch(`${baseUrl}/api/database/${dbId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
    body: JSON.stringify({ settings: { 'database-enable-actions': true } }),
  })

  console.log(enableResponse)
}

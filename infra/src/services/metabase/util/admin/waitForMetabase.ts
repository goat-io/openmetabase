import { setTimeout } from 'timers/promises'

export async function waitForMetabase(baseUrl: string) {
  console.log('⌚ Waiting for Metabase to start at', baseUrl)

  while (true) {
    try {
      const res = await fetch(`${baseUrl}/api/session/properties`, {
        method: 'GET',
      })

      if (res.ok) {
        console.log('✅ Metabase is up!')
        break
      }

      if (res.ok === false) {
        console.log('🔄 Metabase not ready, retrying...')
        await setTimeout(5000)
      }
    } catch {
      console.log('🔄 Metabase not ready, retrying...')
      await setTimeout(5000)
    }
  }
}

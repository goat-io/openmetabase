import { enableActionsInDatasource } from './enableActionsInDatasource'

interface MetabaseDatabase {
  id: number
  name: string
  engine: string
}

interface MetabaseDatabaseListResponse {
  data: MetabaseDatabase[]
}

// Add Gluepay Database source
export async function addDataSource({
  baseUrl,
  mbToken,
  dbHost,
  dbName,
  dbNameInMetabase,
  dbPassword,
  dbPort,
  dbUser,
  engine,
}: {
  mbToken: string
  baseUrl: string
  dbHost: string
  dbName: string
  dbPort: string | null | number
  dbUser: string
  dbPassword: string | null
  dbNameInMetabase: string
  engine: 'mysql' | 'postgres'
}): Promise<number | undefined> {
  console.log(
    `🔍 Checking if ${engine} database source (${dbNameInMetabase}) exists...`,
  )

  // Fetch existing databases
  const existingDatabasesRes = await fetch(`${baseUrl}/api/database`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
  })

  if (!existingDatabasesRes.ok) {
    console.error(
      '❌ Failed to fetch database list:',
      await existingDatabasesRes.text(),
    )
    return
  }

  const existingDatabases =
    (await existingDatabasesRes.json()) as MetabaseDatabaseListResponse

  const dbExists = existingDatabases.data.find(
    (db) => db.name === dbNameInMetabase,
  )

  if (dbExists) {
    console.log(
      `✅ Gluepay database (${dbNameInMetabase}) already exists, skipping creation.`,
    )

    return dbExists.id
  }

  console.log(`🛠 Adding ${engine} database source (${dbNameInMetabase})...`)

  // Create database if not found
  const createResponse = await fetch(`${baseUrl}/api/database`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
    body: JSON.stringify({
      engine: engine,
      name: dbNameInMetabase,
      details: {
        host: dbHost,
        port: dbPort,
        dbname: dbName,
        user: dbUser,
        password: dbPassword,
        tunnel_enabled: false,
        ssl: false,
      },
    }),
  })

  if (createResponse.ok) {
    console.log(`✅ ${engine} database (${dbNameInMetabase}) added!`)
    const response = (await createResponse.json()) as MetabaseDatabase

    await enableActionsInDatasource({
      baseUrl,
      dbId: response.id,
      mbToken,
    })
    return response.id
  } else {
    console.error(
      `❌ Failed to add ${engine} database:`,
      await createResponse.text(),
    )
    return undefined
  }
}

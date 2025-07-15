import dotenv from 'dotenv'
dotenv.config()
import { waitForMetabase } from './util/admin/waitForMetabase'
import { createAdminUser } from './util/admin/createAdminUser'
import { enableEmbeddings } from './util/admin/enableEmbeddings'
import { addDataSource } from './util/admin/addDataSource'
import { secretService } from '@src/secretService'

export async function setupMetabase(projectName?: string) {
  const ADMIN_EMAIL = process.env.MB_ADMIN_EMAIL || 'admin@mycompany.com'
  const ADMIN_PASSWORD = process.env.MB_ADMIN_PASSWORD || 'testadmin123'
  const METABASE_HOST = process.env.MB_HOSTNAME || '127.0.0.1'
  const METABASE_PORT = process.env.MB_PORT || 3000
  const METABASE_URL = `http://${METABASE_HOST}:${METABASE_PORT}`

  const DB_HOST = process.env.MAIN_DB_HOST || `${projectName}-postgresql-local`
  const DB_NAME = process.env.MAIN_DB_NAME || `metabase`
  const DB_PORT = process.env.MAIN_DB_PORT || '5432'
  const DB_USER = process.env.MAIN_DB_USER || 'root'
  const DB_PASSWORD =
    process.env.MAIN_DB_PASSWORD || secretService.POSTGRES_DB_PASSWORD
  const nameInMetabase = 'test-metabase-db'

  const PROJECT_NAME = projectName || process.argv[2] || process.env.APP_NAME

  if (!PROJECT_NAME) {
    console.error('❌ Project name is required as the first argument.')
    console.log(process.argv)
    process.exit(1)
  }

  await waitForMetabase(METABASE_URL)

  const mbToken = await createAdminUser({
    baseUrl: METABASE_URL,
    userName: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })

  await enableEmbeddings({
    baseUrl: METABASE_URL,
    mbToken,
  })

  console.log({
    baseUrl: METABASE_URL,
    dbHost: DB_HOST,
    dbName: DB_NAME,
    dbPassword: DB_PASSWORD,
    dbNameInMetabase: nameInMetabase,
    dbPort: DB_PORT,
    dbUser: DB_USER,
    engine: 'postgres',
    mbToken,
  })
  await addDataSource({
    baseUrl: METABASE_URL,
    dbHost: DB_HOST,
    dbName: DB_NAME,
    dbPassword: DB_PASSWORD,
    dbNameInMetabase: nameInMetabase,
    dbPort: DB_PORT,
    dbUser: DB_USER,
    engine: 'postgres',
    mbToken,
  })

  //   const [databaseId, collectionId] = await Promise.all([
  //     addDatabaseSource(mbToken),
  //     getOrCreateCollection(mbToken),
  //   ])

  //   const [
  //     comments,
  //     accounts,
  //     posts,
  //     privateMessages,
  //     avgUserCreationDay,
  //     createdAccounts,
  //     accumulatedAccounts,
  //   ] = await Promise.all([
  //     getOrCreateQuestion({mbToken, collectionId, databaseId}),
  //     getOrCreateAccountsQuestion({mbToken, collectionId, databaseId}),

  //   ])

  //   const questionIds = {
  //     comments,
  //     accounts,
  //     posts,
  //     privateMessages,
  //     createdAccounts,
  //     accumulatedAccounts,
  //     avgUserCreationDay,
  //   }

  // await getOrCreateSodiumDashboard(token, collectionId, questionIds)
}

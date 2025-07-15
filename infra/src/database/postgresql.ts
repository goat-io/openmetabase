import * as docker from '@pulumi/docker'
import * as postgresql from '@pulumi/postgresql'
import { env } from '@src/index'
import { secretService } from '@src/secretService'
import { dockerProvider } from '../dockerProvider'
import { network } from '../network'

// Define the environment variables for the PostgreSQL setup
export const metabaseDBName = secretService.METABASE_DB_NAME
const dbUserName = secretService.POSTGRES_DB_USER
const dbPassword = secretService.POSTGRES_DB_PASSWORD

export const dbPort = 5432
export const postgresContainerName = `${env.APP_NAME}-postgresql-${process.env.APP_ENV}`

export const postgresContainer = new docker.Container(
  'postgres-cluster',
  {
    image: 'postgres:17-alpine',
    name: postgresContainerName,
    restart: 'unless-stopped',
    publishAllPorts: true,
    healthcheck: {
      tests: ['CMD-SHELL', `pg_isready -d ${metabaseDBName} -U ${dbUserName}`],
      interval: '10s',
      timeout: '10s',
      retries: 5,
      startPeriod: '10s',
    },
    envs: [
      `POSTGRES_DB=${metabaseDBName}`,
      `POSTGRES_USER=${dbUserName}`,
      `POSTGRES_PASSWORD=${dbPassword}`,
    ],
    ports: [
      {
        internal: dbPort,
        external: dbPort,
      },
    ],
    networksAdvanced: [{ name: network.name }],
    labels: [
      {
        label: 'com.docker.compose.service',
        value: env.APP_NAME,
      },
      {
        label: 'com.docker.compose.project',
        value: env.APP_NAME,
      },
    ],
  },
  {
    dependsOn: network,
    ignoreChanges: ['image'],
    provider: dockerProvider,
  },
)

// Create a provider for the local PostgreSQL instance
export const postgresProvider = new postgresql.Provider(
  'local-postgres-provider',
  {
    host: `127.0.0.1`,
    port: dbPort, // default PostgreSQL port
    username: dbUserName,
    password: dbPassword,
    sslmode: 'disable', // Disable SSL for local environment
  },
)

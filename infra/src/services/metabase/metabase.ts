import * as path from 'path'
import * as docker from '@pulumi/docker'
import * as dockerBuild from '@pulumi/docker-build'
import { env } from '@src/index'
import * as command from '@pulumi/command'
import { version } from '../../../package.json'
import { localIP } from '../../const'
import { dockerBuildProvider, dockerProvider } from '../../dockerProvider'
import {
  metabaseDBName,
  postgresContainerName,
} from '../../database/postgresql'
import { network } from '../../network'
import { secretService } from '@src/secretService'

const imageName = 'metabase-local'
const versionedImageName = `${imageName}:${version}`
const dbPassword = secretService.POSTGRES_DB_PASSWORD
const metabaseRootPath = __dirname

// export const metabaseBuiltImage = new dockerBuild.Image(
//   'metabaseImage',
//   {
//     tags: [versionedImageName],
//     push: false,
//     dockerfile: {
//       location: path.join(metabaseRootPath, `Dockerfile`),
//     },
//     context: {
//       location: metabaseRootPath,
//     },
//     platforms:
//       process.arch === 'arm' || process.arch === 'arm64'
//         ? ['linux/arm64']
//         : ['linux/amd64'],
//     exports: [
//       {
//         docker: {},
//       },
//     ],
//   },
//   {
//     provider: dockerBuildProvider,
//   },
// )

// Define a Docker container resource that uses the built image
export const metabaseContainer = new docker.Container(
  'metabaseContainer',
  {
    image: 'metabasetl:0.0.2',
    name: `${env.APP_NAME}-metabase-${process.env.APP_ENV}`,
    restart: 'unless-stopped',
    ports: [
      {
        internal: 3000,
        external: 3000,
      },
    ],
    networksAdvanced: [
      {
        name: network.name,
      },
    ],
    envs: [
      `MB_DB_TYPE=postgres`,
      `MB_DB_DBNAME=${metabaseDBName}`,
      `MB_DB_PORT=5432`,
      `MB_DB_USER=${secretService.POSTGRES_DB_USER}`,
      `MB_DB_PASS=${dbPassword}`,
      `MB_DB_HOST=${postgresContainerName}`,
    ],
    healthcheck: {
      tests: ['curl --fail -I http://localhost:3000/api/health || exit 1'],
      interval: '15s',
      timeout: '5s',
      retries: 5,
    },
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
    hosts: [
      {
        host: 'assets.a.getsodium.com',
        ip: localIP || '192.168.1.138',
      },
    ],
  },
  {
    dependsOn: [network],
    provider: dockerProvider,
  },
)

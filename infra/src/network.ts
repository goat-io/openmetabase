import * as docker from '@pulumi/docker'
import { env } from '@src/index'
import { dockerProvider } from './dockerProvider'

export const network = new docker.Network(
  'network',
  {
    name: `${env.APP_NAME}-network`,
    driver: 'bridge',
  },
  {
    provider: dockerProvider,
    dependsOn: [dockerProvider],
  },
)

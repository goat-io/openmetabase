import { execSync } from 'child_process'
import { readdirSync, rmSync, unlinkSync } from 'fs'
import { join } from 'path'
import { LocalWorkspace } from '@pulumi/pulumi/automation'
import { setupMetabase } from './services/metabase/setupMetabase'

const platform = process.platform

export const env = {
  local: true,
  APP_ENV: 'local',
  APP_NAME: 'backoffice',
}
const containerCmd = 'docker'

const getLocalEnv = async () => {
  const postgresql = await import('@src/database/postgresql')
  const metabase = await import('@src/services/metabase/metabase')

  return {
    postgresql,
    metabase,
  }
}

const run = async () => {
  execSync(
    `${containerCmd} ps -a --filter "name=${env.APP_NAME}-" -q | xargs -r ${containerCmd} stop && ${containerCmd} ps -a --filter "name=${env.APP_NAME}-" -q | xargs -r ${containerCmd} rm && ${containerCmd} volume ls -q | grep ${env.APP_NAME}- | xargs -r ${containerCmd} volume rm`,
    { stdio: 'inherit' },
  )
  execSync(`${containerCmd} network rm -f ${env.APP_NAME}-network`)

  let pulumiUser
  try {
    pulumiUser = execSync('pulumi whoami').toString().trim()
  } catch (err: any) {
    console.error('Error retrieving Pulumi user:', err.message)
    process.exit(1)
  }

  console.log('=============================================')
  console.log(`    🚀 Deploying Metabase 🚀    `)
  console.log('---------------------------------------------')
  console.log(`Pulumi user: ${pulumiUser}`)
  console.log('=============================================')

  const stateFolder = join(__dirname, '../pulumi-state')

  // Remove all previous states so we have a blank start each time
  if (env.APP_ENV === 'local') {
    const projectStateFolder = join(
      stateFolder,
      '.pulumi',
      'stacks',
      env.APP_NAME,
    )

    const projectLocksFolder = join(
      stateFolder,
      '.pulumi',
      'locks/organization',
      env.APP_NAME,
      `local-${platform}`,
    )

    rmSync(projectLocksFolder, { recursive: true, force: true })

    const prefix = 'local-'
    const files = readdirSync(projectStateFolder)

    for (const file of files) {
      if (file.startsWith(prefix)) {
        unlinkSync(join(projectStateFolder, file))
      }
    }
  }

  const stack = await LocalWorkspace.createOrSelectStack(
    {
      stackName: env.local
        ? `organization/${env.APP_NAME}/local-${platform}`
        : `organization/${env.APP_NAME}/${env.APP_ENV}`,
      projectName: env.APP_NAME,
      program: env.local ? getLocalEnv : getLocalEnv,
    },

    {
      workDir: join(__dirname, '../'),
      projectSettings: {
        name: env.APP_NAME,
        runtime: 'nodejs',
        backend: {
          url: `file://${stateFolder}`,
        },
      },
      envVars: {
        PULUMI_CONFIG_PASSPHRASE: '',
      },
    },
  )

  try {
    console.log('Stack up')
    await stack.up({
      onOutput: console.log,
      continueOnError: false,
      logToStdErr: true,
    })
  } catch (err: any) {
    // Object.keys(err.commandResult)
    console.log(err)
    console.log(String(err).split('\n').reverse().join('\n'))
    console.log(
      String(err.commandResult.err.stdout).split('\n').reverse().join('\n'),
    )

    process.exit(1)
  }

  await setupMetabase(env.APP_NAME)
}

run().catch((err) => {})

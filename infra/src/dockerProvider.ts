import * as docker from '@pulumi/docker'
import * as dockerBuild from '@pulumi/docker-build'

const dockerHost =
  process.platform === 'win32'
    ? 'npipe:////./pipe/docker_engine'
    : 'unix:///var/run/docker.sock'

export const dockerProvider = new docker.Provider('docker', {
  // host: 'unix:///run/podman/podman.sock',
})

export const dockerBuildProvider = new dockerBuild.Provider('dockerBuild', {
  // host: 'unix:///run/podman/podman.sock',
})

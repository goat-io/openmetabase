import os from 'os'
import * as path from 'path'
import packageJson from '../package.json'

export interface PackageInfo {
  name: string
  version: string
  description: string
}

export const pkg = packageJson
export const srcPath = path.join(__dirname, '.')
export const projectRootPath = path.join(srcPath, '../../')
export const rootPath = path.join(srcPath, '../')

const getLocalIpAddress = (): string | null => {
  const networkInterfaces = os.networkInterfaces()
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const addresses = networkInterfaces[interfaceName] || []
    for (const address of addresses) {
      if (
        address.family === 'IPv4' &&
        !address.internal &&
        address.netmask &&
        address.netmask !== '255.255.255.255' // Ensure it has a valid gateway
      ) {
        return address.address
      }
    }
  }
  return null
}
export const localIP = getLocalIpAddress()

const path = require('path')
const tsConfigPaths = require('tsconfig-paths')
const tsConfig = require('./tsconfig.json')

const baseUrl = tsConfig.compilerOptions.baseUrl || '.'
const outDir = tsConfig.compilerOptions.outDir || '.'

const baseUrlPath = path.resolve(outDir, baseUrl)

const explicitParams = {
  baseUrl: baseUrlPath,
  paths: tsConfig.compilerOptions.paths,
}
tsConfigPaths.register(explicitParams)
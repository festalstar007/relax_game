import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const lobbyDist = path.join(repoRoot, 'apps', 'lobby', 'dist')
const gamesRoot = path.join(repoRoot, 'packages', 'games')
const outputDir = path.join(repoRoot, 'dist-site')

async function exists(targetPath) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(lobbyDist))) {
    throw new Error(`未找到大厅构建产物: ${lobbyDist}。请先运行 pnpm run build:all`)
  }

  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })

  await cp(lobbyDist, outputDir, { recursive: true })

  const entries = await readdir(gamesRoot, { withFileTypes: true })
  const gameNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()

  const redirects = []

  for (const gameName of gameNames) {
    const gameDist = path.join(gamesRoot, gameName, 'dist')
    if (!(await exists(gameDist))) {
      throw new Error(`未找到游戏构建产物: ${gameDist}。请先运行 pnpm run build:all`)
    }

    const gameOutputDir = path.join(outputDir, gameName)
    await mkdir(gameOutputDir, { recursive: true })
    await cp(gameDist, gameOutputDir, { recursive: true })
    redirects.push(`/${gameName}/* /${gameName}/index.html 200`)
  }

  redirects.push('/* /index.html 200')

  await writeFile(path.join(outputDir, '_redirects'), `${redirects.join('\n')}\n`, 'utf8')

  console.log(`聚合完成：${outputDir}`)
  console.log(`包含游戏：${gameNames.join(', ')}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

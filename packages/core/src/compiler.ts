import * as fs from 'fs/promises'
import * as path from 'path'
import type { Route } from './route'
import { resolveRoute, getRouteTitle } from './route'
import { compileProgram } from './program'
import { parse } from './parser'

async function isDir(path: string): Promise<boolean> {
  const stat = await fs.lstat(path)
  return stat.isDirectory()
}

async function compileRoutes(rootDirPath: string, rootDirName?: string) {
  const routes: Route[] = []

  const dirContent = await fs.readdir(rootDirPath)

  const files: string[] = []
  const folders: string[] = []

  for (const item of dirContent) {
    if (item.endsWith('.ts')) {
      const fileContent = await fs.readFile(path.resolve(rootDirPath, item), 'utf-8')
      if (!fileContent.trim().startsWith('/** @scripter-ignore */')) {
        files.push(item)
      }
    } else {
      const isItemDir = await isDir(path.resolve(rootDirPath, item))
      if (isItemDir) {
        folders.push(item)
      }
    }
  }

  // sort files alphabetically
  files.sort()

  // sort folders alphabetically
  folders.sort()

  for (const file of files) {
    const fileName = file.replace('.ts', '')
    const fileContent = await fs.readFile(path.resolve(rootDirPath, file), 'utf-8')
    routes.push({
      type: 'function',
      route: resolveRoute(fileName, rootDirName),
      title: getRouteTitle(fileName),
      params: parse(fileContent).params,
    })
  }

  for (const folder of folders) {
    const folderName = typeof rootDirName !== 'undefined' ? `${rootDirName}/${folder}` : folder
    const folderPath = path.resolve(rootDirPath, folder)
    const folderChildrenPaths = await compileRoutes(folderPath, folderName)
    if (folderChildrenPaths.length > 0) {
      routes.push({
        type: 'module',
        route: resolveRoute(folder, rootDirName),
        title: getRouteTitle(folder),
        children: folderChildrenPaths,
      })
    }
  }

  return routes
}

export async function compile(rootDir: string, outputDir: string) {
  const routes = await compileRoutes(rootDir)
  const program = await compileProgram(rootDir, outputDir, routes)

  // @TODO: Update names
  return {
    routes,
    program,
  }
}

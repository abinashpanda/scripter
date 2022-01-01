import * as fs from 'fs/promises'
import * as path from 'path'
import { capitalize, words } from 'lodash'

export type ScripterFunction = {
  type: 'function'
  title: string
  description?: string
  path: string
}

export type ScripterFunctionDirectory = {
  type: 'directory'
  title: string
  path: string
  children: ScripterNode[]
}

export type ScripterNode = ScripterFunction | ScripterFunctionDirectory

function getTitle(name: string) {
  return capitalize(words(name).join(' '))
}

function getPath(itemName: string, rootDirName?: string) {
  return typeof rootDirName !== 'undefined' ? `${rootDirName}____${itemName}` : itemName
}

async function isDir(path: string): Promise<boolean> {
  const stat = await fs.lstat(path)
  return stat.isDirectory()
}

async function getPaths(rootDirPath: string, rootDirName?: string): Promise<ScripterNode[]> {
  const paths: ScripterNode[] = []

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
    paths.push({
      type: 'function',
      path: getPath(fileName, rootDirName),
      title: getTitle(fileName),
    })
  }

  for (const folder of folders) {
    const folderName = typeof rootDirName !== 'undefined' ? `${rootDirName}____${folder}` : folder
    const folderChildrenPaths = await getPaths(path.resolve(rootDirPath, folder), folderName)
    if (folderChildrenPaths.length > 0) {
      paths.push({
        type: 'directory',
        path: getPath(folder, rootDirName),
        title: getTitle(folder),
        children: folderChildrenPaths,
      })
    }
  }

  return paths
}

export async function compile(scripterFunctionsDir: string, outputDir: string): Promise<{ paths: ScripterNode[] }> {
  const paths = await getPaths(scripterFunctionsDir)
  return {
    paths,
  }
}

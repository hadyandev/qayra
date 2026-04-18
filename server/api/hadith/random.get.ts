

import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default defineEventHandler(async () => {
  try {
    const { stdout } = await execAsync('node server/scripts/mcp-query.mjs')
    
    try {
      const parsed = JSON.parse(stdout)
      return { data: parsed, error: null }
    } catch {
      return { data: stdout, error: null }
    }
  } catch (error: any) {
    console.error('Hadith fetched failed:', error)
    return { data: null, error: error?.message || 'Failed to fetch hadith from MCP' }
  }
})

import { Pool } from 'pg'

// Koneksi READ-ONLY ke database sistem lain.
// Kredensial dev_user (career_db) & mycomp_user (mycompetency_db) hanya punya
// hak akses baca/tulis normal (bukan superuser) — ITMS hanya melakukan SELECT.
export const careerPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'career_db',
  user: 'dev_user',
  password: 'HSTdev2026',
  max: 5,
})

export const compPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mycompetency_db',
  user: 'mycomp_user',
  password: 'Apriangga11',
  max: 5,
})

// ============================================
// Fuzzy job-name matching — port persis dari career-api/server.js
// (gapNormalizeJobName, gapJaccardSimilarity, GAP_IGNORE_WORDS)
// ============================================
const GAP_IGNORE_WORDS = new Set([
  'am', 's', 'm', 'sr', 'vp', 'evp', 'jr', 'staf', 'staff', 'senior',
  'besar', 'kecil', 'kelas', 'grade', 'executive', 'of', 'and', 'the',
])

export function gapNormalizeJobName(name: string | null | undefined): Set<string> {
  return new Set(
    (name || '')
      .toLowerCase()
      .replace(/[()]/g, ' ')
      .replace(/\d+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !GAP_IGNORE_WORDS.has(w))
  )
}

export function gapJaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  const intersection = [...a].filter((x) => b.has(x)).length
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : intersection / union
}

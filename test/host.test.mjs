// Host half + cross-file contracts. Zero dependencies: `node --test test/host.test.mjs`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

import { build } from '../scripts/build.mjs'

const host = await import('../lib/index.js')
const client = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const index = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

function rows() {
  const table = []
  let event = null
  host.apply({ on: (name, handler) => { event = name; handler(table) } })
  return { event, table }
}

test('apply contributes the first frame to webserver/index-inject', () => {
  const { event, table } = rows()
  assert.equal(event, 'webserver/index-inject')
  assert.deepEqual(table.map((row) => row.kind), ['style', 'script', 'global'])
  assert.equal(table[1].placement, 'head')
  assert.match(table[0].text, /html\.dshgov-first::before/)
})

test('the injected script is valid JavaScript', () => {
  const { table } = rows()
  assert.doesNotThrow(() => new Function(table[1].text))
})

test('the injected version matches package.json', () => {
  const { table } = rows()
  assert.equal(table[2].value, pkg.version)
})

test('plugin name matches between the two halves', () => {
  assert.equal(host.name, 'boot-gov')
  assert.match(client, /exports\.name = 'boot-gov'/)
})

test('shared keys are identical in both halves', () => {
  for (const key of ['MODE_KEY', 'FIRST_FRAME_GLOBAL', 'VERSION_GLOBAL']) {
    const pattern = new RegExp(`const ${key} = '([^']+)'`)
    assert.equal(index.match(pattern)?.[1], client.match(pattern)?.[1], key)
  }
})

test('first-frame background matches the paper colour of the splash', () => {
  const bg = index.match(/FIRST_FRAME_BG = '(#[0-9a-f]{6})'/)?.[1]
  assert.ok(bg)
  assert.ok(client.includes(`background:${bg}`), 'gb-root background should equal FIRST_FRAME_BG')
})

test('client z-index sits one above the host cover', () => {
  const cover = Number(index.match(/FIRST_FRAME_Z = (\d+)/)?.[1])
  const overlay = Number(client.match(/const Z = (\d+)/)?.[1])
  assert.equal(overlay, cover + 1)
})

test('lib/client.js is up to date with src/ (run npm run build)', () => {
  assert.equal(client, build())
})

test('the version is written only in package.json', () => {
  assert.doesNotMatch(index, /VERSION = '\d/)
  assert.doesNotMatch(client, /V0\.\d/)
})

test('package includes linked contributing docs and keeps the demo external', () => {
  const output = execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
  })
  const files = new Set(JSON.parse(output)[0].files.map((file) => file.path))
  assert.ok(files.has('CONTRIBUTING.md'))
  assert.ok(!files.has('docs/demo.gif'))
  for (const name of ['README.md', 'README.en.md']) {
    assert.ok(files.has(name))
    const readme = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8')
    assert.match(readme, /!\[[^\]]*\]\(https:\/\/raw\.githubusercontent\.com\/okiexia-ui\/dsh-gov-boot\/main\/docs\/demo\.gif\)/)
  }
})

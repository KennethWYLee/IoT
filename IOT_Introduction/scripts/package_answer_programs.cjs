// Assemble local teaching copies without changing canonical code or uploading files.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const course = path.resolve(__dirname, '..');
const weeks = [2,3,4,5,6,7,11,12,14,15];
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const slash = value => value.replaceAll('\\', '/');
function inside(root, relative) {
  const target = path.resolve(root, relative);
  assert(!path.relative(root, target).startsWith('..') && target !== root, relative);
  return target;
}
function run(week, check = false) {
  assert(weeks.includes(week), 'Unsupported answer week');
  const directory = path.join(course, `docs/teaching_drafts/week${week}_answers`);
  const configFile = path.join(directory, 'programs.sources.json');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const out = path.join(directory, 'programs');
  const manifestFile = path.join(out, 'manifest.json');
  const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;
  const files = [];
  const destinations = new Set();
  for (const item of config.files) {
    const source = inside(course, item.source);
    const destination = inside(out, item.destination);
    assert(!destinations.has(destination), `Duplicate destination ${destination}`);
    destinations.add(destination);
    assert(!/^(secrets\.h|\.env|.*\.(db|sqlite|sqlite3|pem|key))$/i.test(path.basename(destination)), 'Private runtime data is not a teaching file');
    const bytes = fs.readFileSync(source);
    if (check) {
      assert(fs.existsSync(destination), `Missing ${destination}`);
      assert(fs.readFileSync(destination).equals(bytes), `Program copy differs: ${destination}`);
    } else {
      if (fs.existsSync(destination) && !fs.readFileSync(destination).equals(bytes)) {
        const old = previous?.files.find(f => f.destination === item.destination);
        assert(old && sha(fs.readFileSync(destination)) === old.sha256, `Preserving an edited copy: ${destination}`);
      }
      fs.mkdirSync(path.dirname(destination), {recursive:true});
      fs.writeFileSync(destination, bytes);
    }
    files.push({...item, sha256:sha(bytes)});
  }
  const readme = `# Week ${week} programs\n\n` +
    'Open the file named in the Ans. Keep each Arduino sketch in its same-named folder.\n' +
    'Save your own working copy before changing settings. Libraries and safe wiring are explained in the Ans.\n' +
    'Only example credential files are included. Never share secrets.h, .env, passwords, or runtime databases.\n\n' +
    config.entries.map(e => `- ${e.label}: \`${e.file}\``).join('\n') + '\n';
  const manifest = {week, configSha256:sha(fs.readFileSync(configFile)), files};
  if (check) {
    assert.deepEqual(previous, manifest, 'Stale program manifest');
    assert.equal(fs.readFileSync(path.join(out, 'README.md'), 'utf8'), readme);
    for (const entry of config.entries) assert(destinations.has(inside(out, entry.file)), entry.file);
    for (const item of files.filter(f => f.destination.endsWith('.ino'))) {
      assert.equal(path.basename(path.dirname(item.destination)), path.basename(item.destination, '.ino'));
    }
  } else {
    fs.writeFileSync(path.join(out, 'README.md'), readme);
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  }
  return {week, files:files.length, programs:config.entries.length, directory:slash(path.relative(course,out))};
}
module.exports = {run};
if (require.main === module) {
  const numbers = process.argv.slice(2).filter(a=>/^\d+$/.test(a)).map(Number);
  for (const week of numbers.length ? numbers : weeks) console.log(JSON.stringify(run(week, process.argv.includes('--check'))));
}

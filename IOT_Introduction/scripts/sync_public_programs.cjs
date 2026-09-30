// Copy only explicitly approved weeks. This command never commits or uploads.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const course = path.resolve(__dirname, '..');
const root = path.dirname(course);
const approvedWeeks = [3];
const args = process.argv.slice(2);
assert(args.every(a => a === '--check' || /^\d+$/.test(a)), 'Unknown argument');
const weeks = args.filter(a => /^\d+$/.test(a)).map(Number);
assert(weeks.length > 0, 'Specify an approved week, for example: 3 --check');
const check = args.includes('--check');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
function inside(base, relative) {
  const file = path.resolve(base, relative);
  const rel = path.relative(base, file);
  assert(rel && !rel.startsWith('..') && !path.isAbsolute(rel), relative);
  return file;
}
for (const week of weeks) {
  assert(approvedWeeks.includes(week), `Week ${week} has no public-release approval`);
  const config = JSON.parse(read(path.join(course, `docs/teaching_drafts/week${week}_answers/programs.sources.json`)));
  assert.equal(config.week, week);
  const out = path.join(root, 'program', `week${week}`);
  const manifestFile = path.join(out, 'manifest.json');
  const previous = fs.existsSync(manifestFile) ? JSON.parse(read(manifestFile)) : null;
  const files = [];
  const seen = new Set();
  // Validate the whole batch before replacing any previously exported file.
  for (const item of config.files) {
    assert(item.destination.endsWith('.ino'), 'Only Arduino sketches are approved');
    assert(!seen.has(item.destination), 'Duplicate destination');
    seen.add(item.destination);
    assert.equal(path.basename(path.dirname(item.destination)), path.basename(item.destination, '.ino'));
    const source = inside(course, item.source);
    const destination = inside(out, item.destination);
    const content = read(source);
    if (fs.existsSync(destination) && read(destination) !== content) {
      const old = previous?.files.find(f => f.destination === item.destination);
      assert(!check && old && sha(read(destination)) === old.sha256,
        `Preserving edited public copy: ${item.destination}`);
    }
    if (check) assert(fs.existsSync(destination), `Missing ${destination}`);
    files.push({...item, sha256: sha(content), content, destinationPath: destination});
  }
  for (const entry of config.entries) assert(seen.has(entry.file), entry.file);
  const manifest = {week, textHashLineEndings: 'LF', files: files.map(({source, destination, sha256}) => ({source, destination, sha256}))};
  if (check) {
    assert.deepEqual(previous, manifest, 'Stale public program manifest');
  } else {
    for (const file of files) {
      fs.mkdirSync(path.dirname(file.destinationPath), {recursive: true});
      fs.writeFileSync(file.destinationPath, file.content);
    }
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  }
  console.log(JSON.stringify({week, files: files.length, checked: check, uploaded: false}));
}

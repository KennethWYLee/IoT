// Copy only explicitly approved weeks. This command never commits or uploads.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const course = path.resolve(__dirname, '..');
const root = path.dirname(course);
const approvedWeeks = [2, 3, 4, 5];
const week4Released = new Set([
  'environment_display_oled/environment_display_oled.ino',
  'environment_display_serial/environment_display_serial.ino',
  'environment_alert_oled/environment_alert_oled.ino',
  'environment_alert_serial/environment_alert_serial.ino',
  'environment_recorder_oled/environment_recorder_oled.ino',
  'environment_recorder_serial/environment_recorder_serial.ino',
  'environment_analysis_oled/environment_analysis_oled.ino',
  'environment_analysis_serial/environment_analysis_serial.ino',
  'START_HERE.md', 'dual_alarm_analysis.html', 'alarm_report.js',
  'dual_alarm_report.js', 'analysis_client.js', 'dual_analysis_ui.js',
]);
const week5Released = new Set(['desk_status/desk_status.ino', 'focus_countdown/focus_countdown.ino']);
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
  const configPath = week === 1 ? 'Week_01_Course_Orientation/programs.sources.json'
    : `docs/teaching_drafts/week${week}_answers/programs.sources.json`;
  const config = JSON.parse(read(path.join(course, configPath)));
  assert.equal(config.week, week);
  const out = path.join(root, 'program', `week${week}`);
  const manifestFile = path.join(out, 'manifest.json');
  const previous = fs.existsSync(manifestFile) ? JSON.parse(read(manifestFile)) : null;
  const files = [];
  const seen = new Set();
  // Validate the whole batch before replacing any previously exported file.
  const selected = config.files.filter(item => week === 4 ? week4Released.has(item.destination)
    : item.destination.endsWith('.ino') && (week !== 5 || week5Released.has(item.destination)));
  if (week === 4) assert.deepEqual(new Set(selected.map(item => item.destination)), week4Released,
    'Week4 release contains exactly the eight sketches and six required support files');
  if (week === 5) assert.deepEqual(new Set(selected.map(item => item.destination)), week5Released,
    'Week5 release contains only Q1/Q2');
  for (const item of selected) {
    assert(/\.(ino|md|html|js)$/.test(item.destination), 'Unexpected public file type');
    assert(!seen.has(item.destination), 'Duplicate destination');
    seen.add(item.destination);
    if (item.destination.endsWith('.ino')) assert.equal(path.basename(path.dirname(item.destination)), path.basename(item.destination, '.ino'));
    const source = inside(course, item.source);
    const destination = inside(out, item.destination);
    const sourceContent = read(source);
    const content = week === 4 && item.destination.endsWith('.ino') ? sourceContent.replace(/[ \t]+$/gm, '') : sourceContent;
    if (fs.existsSync(destination) && read(destination) !== content) {
      const old = previous?.files.find(f => f.destination === item.destination);
      assert(!check && old && sha(read(destination)) === old.sha256,
        `Preserving edited public copy: ${item.destination}`);
    }
    if (check) assert(fs.existsSync(destination), `Missing ${destination}`);
    files.push({...item, sha256: sha(content), content, destinationPath: destination});
  }
  for (const entry of config.entries.filter(entry => week === 4 ? week4Released.has(entry.file)
    : week !== 5 || week5Released.has(entry.file))) {
    assert(seen.has(entry.file), entry.file);
  }
  const manifest = {week, textHashLineEndings: 'LF', files: files.map(({source, destination, sha256}) => ({source, destination, sha256}))};
  if (week === 4) manifest.textHashWhitespace = 'Strip trailing spaces and tabs';
  if (check) {
    assert.deepEqual(previous, manifest, 'Stale public program manifest');
    const actual = fs.readdirSync(out, {recursive: true}).filter(file => file.endsWith('.ino'))
      .map(file => file.replaceAll('\\', '/')).sort();
    assert.deepEqual(actual, [...seen].filter(file => file.endsWith('.ino')).sort(), 'Unlisted or obsolete public sketches');
  } else {
    for (const file of files) {
      fs.mkdirSync(path.dirname(file.destinationPath), {recursive: true});
      fs.writeFileSync(file.destinationPath, file.content);
    }
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  }
  console.log(JSON.stringify({week, files: files.length, checked: check, uploaded: false}));
}

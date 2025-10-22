import { spawn } from 'bun';

function main() {
  const cpus = navigator.hardwareConcurrency;
  console.log(`Starting cluster with ${cpus} workers...`);

  const buns = new Array<Bun.Subprocess>(cpus);

  for (let i = 0; i < cpus; i++) {
    buns[i] = spawn({
      cmd: ['bun', 'run', './.output/server/index.mjs'],
      stdout: 'inherit',
      stderr: 'inherit',
      stdin: 'inherit',
    });
  }

  function kill() {
    for (const bun of buns) {
      bun.kill();
    }
  }

  process.on('SIGINT', kill);
  process.on('exit', kill);
}

main();

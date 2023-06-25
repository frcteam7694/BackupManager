const fs = require('fs-extra');

const time = document.querySelector('#time');
const desc = document.querySelector('#desc')
const btnComp = document.querySelector("#comp");
const btnSave = document.querySelector("#save");
const btnLoad = document.querySelector("#load");
const list = document.querySelector('main');

let backupsFile;
let backupsDir;
let codeDir;

let backups = [];
let selected = -1;

document.addEventListener('DOMContentLoaded', loadPage);

async function loadPage() {
    let file = await fetch('config.json');
    const json = await file.json();
    backupsFile = json.backupsFile;
    backupsDir = json.backupsDir;
    codeDir = json.codeDir;
    file = await fs.readFileSync(backupsFile, {encoding: 'utf8', flag: 'r'});
    backups = JSON.parse(file);
    list.innerHTML = '';
    for (let i = 0; i < backups.length; i++) {
        list.innerHTML = `<div class="backup${backups[i].comp ? ' comp' : ''}" onclick="select(${i})">${backups[i].time} ${backups[i].desc}</div>` + list.innerHTML;
    }
}

function comp() {
    if (selected != -1) return;
    if (btnComp.classList.contains('enabled')) {
        btnComp.classList.remove('enabled');
    } else {
        btnComp.classList.add('enabled');
    }
}

async function save() {
    if (selected != -1) return;
    let time = getCurrentTime() + '';
    await fs.copySync(codeDir, `${backupsDir}\\${time}`);
    backups.push({time, 'desc': desc.value, 'comp': btnComp.classList.contains('enabled')});
    await fs.writeFileSync(backupsFile, JSON.stringify(backups));
    loadPage();
    deSelect();
}

async function load() {
    if (selected == -1) return;
    if (!confirm('Save the code before loading an old version.')) return;
    await fs.removeSync(codeDir);
    await fs.copySync(`${backupsDir}\\${backups[selected].time}`, codeDir);
}

function select(i) {
    selected = i;
    time.innerText = backups[i].time;
    if (!desc.hasAttribute('readonly')) desc.setAttribute('readonly', '');
    desc.value = backups[i].desc;
    if (backups[i].comp) {
        if (!btnComp.classList.contains('enabled')) btnComp.classList.add('enabled');
    } else {
        if (btnComp.classList.contains('enabled')) btnComp.classList.remove('enabled');
    }
    if (btnSave.classList.contains('enabled')) btnSave.classList.remove('enabled');
    if (!btnLoad.classList.contains('enabled')) btnLoad.classList.add('enabled');
    document.querySelectorAll('.backup').forEach((e) => {
        if (e.outerHTML.includes(`select(${selected}`) && !e.classList.contains('selected')) e.classList.add('selected');
        else if (e.classList.contains('selected')) e.classList.remove('selected');
    });
}

function deSelect() {
    selected = -1;
    if (desc.hasAttribute('readonly')) desc.removeAttribute('readonly');
    desc.value = '';
    if (btnComp.classList.contains('enabled')) btnComp.classList.remove('enabled');
    if (!btnSave.classList.contains('enabled')) btnSave.classList.add('enabled');
    if (btnLoad.classList.contains('enabled')) btnLoad.classList.remove('enabled');
    document.querySelectorAll('.backup').forEach((e) => {
        if (e.classList.contains('selected')) e.classList.remove('selected');
    });
}

function update() {
    if (selected == -1) time.innerText = getCurrentTime();
    requestAnimationFrame(update);
}

function getCurrentTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}`;
}

document.body.onkeyup = (e) => {
    if (e.key === 'Escape' && selected != -1) deSelect();
}

update();

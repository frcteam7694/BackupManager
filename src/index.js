const fs = require('fs-extra');
const path = require('path');
// const git = require('simple-git');

const time = document.querySelector('#time');
const desc = document.querySelector('#desc')
const btnComp = document.querySelector("#comp");
const btnSave = document.querySelector("#save");
const btnLoad = document.querySelector("#load");
const list = document.querySelector('main');
const overlay = document.querySelector("#overlay");
const settingsModal = document.querySelector('#settings');
const backupsFileInput = document.querySelector('#backupsFile');
const backupsDirInput = document.querySelector('#backupsDir');
const codeDirInput = document.querySelector('#codeDir');

let backupsFile;
let backupsDir;
let codeDir;

let backups = [];
let selected = -1;

let inSettings = false;

document.addEventListener('DOMContentLoaded', loadConfig);

async function loadConfig() {
    const json = await fs.readJSONSync('config.json');
    backupsFile = json.backupsFile;
    backupsDir = json.backupsDir;
    codeDir = json.codeDir;
    try {
        let file = await fs.readFileSync(backupsFile, {encoding: 'utf8', flag: 'r'});
        backups = JSON.parse(file);
    } catch (e) {
        backups = [];
    }
    list.innerHTML = '';
    for (let i = 0; i < backups.length; i++) {
        list.innerHTML = `<div class="backup${backups[i].comp ? ' comp' : ''}" onclick="select(${i})">${backups[i].time} ${backups[i].desc}</div>` + list.innerHTML;
    }
}

async function saveConfig() {
    await fs.writeJSONSync('config.json', {
        backupsFile,
        backupsDir,
        codeDir
    });
    loadConfig();
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
    if (selected != -1) {
        deSelect();
        return;
    }
    let time = getCurrentTime() + '';
    await fs.copySync(codeDir, path.join(backupsDir, time));
    backups.push({time, 'desc': desc.value, 'comp': btnComp.classList.contains('enabled')});
    await fs.writeFileSync(backupsFile, JSON.stringify(backups));
    loadConfig();
    deSelect();
}

async function load() {
    if (selected == -1) return;
    if (!confirm('Save the code before loading an old version.')) return;
    await fs.removeSync(codeDir);
    await fs.copySync(path.join(backupsDir, backups[selected].time), codeDir);
}

function select(i) {
    if (selected == i) {
        deSelect();
    } else {
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
            if (e.outerHTML.includes(`select(${selected})`) && !e.classList.contains('selected')) e.classList.add('selected');
            else if (e.classList.contains('selected')) e.classList.remove('selected');
        });
    }
}

function settings(on) {
    inSettings = on;
    if (on) {
        overlay.classList.add('block');
        settingsModal.classList.add('block');
        backupsFileInput.value = backupsFile;
        backupsDirInput.value = backupsDir;
        codeDirInput.value = codeDir;
        setTimeout(() => {
            overlay.classList.add('show');
            settingsModal.classList.add('show');
        }, 10);
    } else {
        overlay.classList.remove('show');
        settingsModal.classList.remove('show');
        backupsFile = backupsFileInput.value;
        backupsDir = backupsDirInput.value;
        codeDir = codeDirInput.value;
        setTimeout(() => {
            overlay.classList.remove('block');
            settingsModal.classList.remove('block');
        }, 260);
        saveConfig();
    }
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

function scroll() {
    if (list.scrollTop < .5) {
        list.setAttribute("scroll", "top");
    } else if (Math.abs(list.scrollTop - (list.scrollHeight - list.clientHeight)) < .5) {
        list.setAttribute("scroll", "bottom");
    } else {
        list.setAttribute("scroll", "mid");
    }
}

function update() {
    if (selected == -1) time.innerText = getCurrentTime();
    scroll();
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
    if (e.key === 'Escape') {
        if (inSettings) {
            settings(false);
        } else if (selected != -1) {
            deSelect();
        }
    }
}

update();

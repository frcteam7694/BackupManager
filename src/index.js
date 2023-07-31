const fs = require('fs-extra');
const path = require('path');
const { simpleGit, CleanOptions } = require('simple-git');

const time = document.querySelector('#time');
const desc = document.querySelector('#desc')
const btnComp = document.querySelector("#comp");
const btnSave = document.querySelector("#save");
const btnLoad = document.querySelector("#load");
const list = document.querySelector('main');
const overlay = document.querySelector("#overlay");
const settingsModal = document.querySelector('#settings');
const codeDirInput = document.querySelector('#codeDir');
const remoteInput = document.querySelector('#remote');

let codeDir;
let remote;
let lastCommit;

let backups = [];
let selected = -1;
let inSettings = false;

document.addEventListener('DOMContentLoaded', loadConfig);

simpleGit().clean(CleanOptions.FORCE);
let git;

async function loadConfig() {
    const json = await fs.readJSONSync(path.join(getExecutableRootPath(), 'config.json'));
    codeDir = json.codeDir;
    remote = json.remote;
    lastCommit = json.lastCommit;
    git = simpleGit(codeDir, { binary: 'git' });
    backups = (await git.log([lastCommit])).all
    list.innerHTML = '';
    for (let i = 0; i < backups.length; i++) {
        list.innerHTML += `<div class="backup${backups[i].message.startsWith('!') ? ' comp' : ''}" onclick="select(${i})">${getTime(i)} ${backups[i].message.substring(1)}</div>`;
    }
    let isRepo = await git.checkIsRepo();
    if (!isRepo) {
        await git.init();
        await git.addRemote('offline', gitRemote);
    }

}

async function saveConfig() {
    await fs.writeJSONSync(path.join(getExecutableRootPath(), 'config.json'), {
        codeDir,
        remote,
        lastCommit
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
    await git.add('.');
    let hash = await git.commit(generateCommitMsg());
    await git.push(['-u', 'offline', 'master']);
    if (selected != -1) {
        deSelect();
        return;
    }
    lastCommit = hash.commit.split(' ')[1];
    saveConfig();
    desc.value = '';
    if (btnComp.classList.contains('enabled')) {
        btnComp.classList.remove('enabled');
    }
}

async function load() {
    if (selected == -1) return;
    if (!confirm('Save the code before loading an old version.')) return;
    git.checkout(backups[selected].hash, '.')
}

function select(i) {
    if (selected == i) {
        deSelect();
    } else {
        selected = i;
        time.innerText = getTime(i);
        if (!desc.hasAttribute('readonly')) desc.setAttribute('readonly', '');
        desc.value = backups[i].message.substring(1);
        if (backups[i].message.startsWith('!')) {
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
        codeDirInput.value = codeDir;
        remoteInput.value = remote;
        setTimeout(() => {
            overlay.classList.add('show');
            settingsModal.classList.add('show');
        }, 10);
    } else {
        overlay.classList.remove('show');
        settingsModal.classList.remove('show');
        codeDir = codeDirInput.value;
        remote = remoteInput.value;
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

function generateCommitMsg() {
    let commitComp = btnComp.classList.contains('enabled') ? '!' : '#';
    let commitDesc = desc.value;
    return commitComp + commitDesc;
}

function getTime(i) {
    return backups[i].date
        .slice(0, -9)
        .replace('T', '-')
        .replace(':', '-');
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

function getExecutableRootPath() {
    let parts = process.execPath.split(path.sep);
    if (process.platform === 'darwin') {
        parts = process.execPath.split('.app')[0].split(path.sep);
    }
    parts.pop(parts.length - 1);
    return parts.join(path.sep);
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

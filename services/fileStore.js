// services/fileStore.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const DB_FILE = path.join(__dirname, '..', 'sifarişlər.txt');
const USERS_FILE = path.join(__dirname, '..', 'users.txt');
const PERMISSIONS_FILE = path.join(__dirname, '..', 'permissions.json');
const CHAT_HISTORY_FILE = path.join(__dirname, '..', 'chat_history.txt');
const EXPENSES_FILE = path.join(__dirname, '..', 'xərclər.txt');
const INVENTORY_FILE = path.join(__dirname, '..', 'inventory.txt');
const AUDIT_LOG_FILE = path.join(__dirname, '..', 'audit_log.txt');
const PHOTO_TXT_FILE = path.join(__dirname, '..', 'photo.txt');
const TRANSPORT_FILE = path.join(__dirname, '..', 'transport.txt');

// --- Ümumi Fayl Oxuma/Yazma Funksiyaları ---
const readFileLines = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.trim().split('\n').filter(Boolean);
};

const safeJsonParse = (line, filePath, index) => {
    try {
        return JSON.parse(line);
    } catch (e) {
        console.error(`Error parsing JSON on line ${index + 1} in ${path.basename(filePath)}:`, line, e);
        return null;
    }
};

const readJsonFile = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf-8');
    if (data.trim() === '') return {};
    return safeJsonParse(data, filePath, 0);
};

const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const writeLinesToFile = (filePath, lines) => {
    fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
};

const appendLineToFile = (filePath, line) => {
    fs.appendFileSync(filePath, line + '\n', 'utf-8');
};

// --- Funksiyaların Təyin Edilməsi ---
const getOrders = () => readFileLines(DB_FILE).map((line, i) => safeJsonParse(line, DB_FILE, i)).filter(Boolean);
const saveAllOrders = (orders) => writeLinesToFile(DB_FILE, orders.map(o => JSON.stringify(o)));

const getUsers = () => {
    const lines = readFileLines(USERS_FILE);
    const users = {};
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 5) {
            const [username, password, role, displayName, ...emailParts] = parts;
            users[username.trim()] = { password: password.trim(), role: role.trim(), displayName: displayName.trim(), email: emailParts.join(':').trim() };
        }
    });
    return users;
};
const saveAllUsers = (users) => {
    const lines = Object.entries(users).map(([username, data]) => 
        `${username}:${data.password}:${data.role}:${data.displayName}:${data.email}`
    );
    writeLinesToFile(USERS_FILE, lines);
};
const addUser = (userData) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    const newUserLine = `${userData.username}:${hashedPassword}:${userData.role}:${userData.displayName}:${userData.email}`;
    appendLineToFile(USERS_FILE, newUserLine);
};

const getPermissions = () => readJsonFile(PERMISSIONS_FILE) || {};
const savePermissions = (permissions) => writeJsonFile(PERMISSIONS_FILE, permissions);

const getChatHistory = () => readFileLines(CHAT_HISTORY_FILE).map((line, i) => safeJsonParse(line, CHAT_HISTORY_FILE, i)).filter(Boolean);
const appendToChatHistory = (message) => appendLineToFile(CHAT_HISTORY_FILE, JSON.stringify(message));

const getExpenses = () => readFileLines(EXPENSES_FILE).map((line, i) => safeJsonParse(line, EXPENSES_FILE, i)).filter(Boolean);
const saveAllExpenses = (expenses) => writeLinesToFile(EXPENSES_FILE, expenses.map(e => JSON.stringify(e)));

const getInventory = () => readFileLines(INVENTORY_FILE).map((line, i) => safeJsonParse(line, INVENTORY_FILE, i)).filter(Boolean);
const saveAllInventory = (items) => writeLinesToFile(INVENTORY_FILE, items.map(i => JSON.stringify(i)));

const getAuditLog = () => readFileLines(AUDIT_LOG_FILE).map((line, i) => safeJsonParse(line, AUDIT_LOG_FILE, i)).filter(Boolean);
const appendToAuditLog = (logEntry) => appendLineToFile(AUDIT_LOG_FILE, JSON.stringify(logEntry));

const appendToPhotoTxt = (linkEntry) => appendLineToFile(PHOTO_TXT_FILE, JSON.stringify(linkEntry));

const getTransportPackages = () => readFileLines(TRANSPORT_FILE).map((line, i) => safeJsonParse(line, TRANSPORT_FILE, i)).filter(Boolean);
const saveAllTransportPackages = (packages) => writeLinesToFile(TRANSPORT_FILE, packages.map(p => JSON.stringify(p)));

module.exports = {
    getOrders, saveAllOrders,
    getUsers, addUser, saveAllUsers,
    getPermissions, savePermissions,
    getChatHistory, appendToChatHistory,
    getExpenses, saveAllExpenses,
    getInventory, saveAllInventory,
    getAuditLog,
    appendToAuditLog,
    appendToPhotoTxt,
    getTransportPackages,
    saveAllTransportPackages
};

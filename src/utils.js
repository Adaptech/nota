const randomBytes = require('crypto');

exports.getTypeName = function getTypeName(obj) {
    if (obj && obj.constructor && obj.constructor.name) {
        return obj.constructor.name;
    }
    return typeof obj;
};

const POSSIBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.generateRandomCode = function generateRandomCode(length) {
    let buf = randomBytes(length);
    let chars = [];
    for (let i = 0; i < length; i++) {
        const ch = buf[i] % 36;
        chars.push(POSSIBLE_CHARS[ch]);
    }
    return chars.join('');
};

function newCall(Cls, args) {
    return new (Function.prototype.bind.apply(Cls, [Cls].concat(args)));
}

exports.newInject = function newInject(Cls, services) {
    const code = Cls.toString();
    const m = code.match(new RegExp('(' + Cls.name + '|constructor)\\(([^)]+)\\)'));
    if (!m || !m[2]) throw new Error('Couldn\'t parse class ' + Cls.name + ' constructor.');
    const params = m[2].split(',');
    const args = params.map(param => {
        const p = param.trim();
        return services[p];
    });
    return newCall(Cls, args);
};

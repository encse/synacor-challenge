import {constant} from "./disassembler";


function lo(val: number): number{
    return val & 0xff;
}

function hi(val: number): number {
    return (val >> 8) & 0xff;
}

function byte(val: number): string {
    return val.toString(16).padStart(2, '0');
}


function char(val: number): string {
    return (val >= 32 && val <128) ? String.fromCharCode(val) : '.';
}

export function hexdump(memory: Uint16Array, baseAddr: number, length: number): string {

    let res = '';

    for (let i = 0; i < length; i++) {
        let addrI = baseAddr + i;
        if (i % 8 == 0) {
            res += '\n';
            res += constant(addrI);
            res += ' ';
        }

        if (i % 4 == 0) {
            res += ' ';
        }

        let valI = memory[addrI];
        res += byte(lo(valI));
        res += ' ';
        res += byte(hi(valI));
        res += ' ';

        if (i % 8 == 7) {
            for (let k = 0; k < 8; k++) {
                let addrK = baseAddr + i - 7 + k;
                let valK = memory[addrK];
                res += char(lo(valK));
                res += char(hi(valK));
            }
        }
    }
    return res;
}

import {blue, bold, cyan, green} from "../util/ansi";
import {operations} from "./operations";

export function constant(num: number) {
    return green(`0x${num.toString(16).padStart(4, '0')}`);
}

export function reg(st: string) {
    return bold(blue(st));
}

export function disassemble(memory: Uint16Array, ip: number, length: number): string {

    let res = '';
    const stArg = (x: number) => (x < 32768 ? constant(x) : reg("abcdefgh"[x - 32768] + 'x'));

    for (let i = 0; i < length; i++) {
        const op = memory[ip];
        const cmdTemplate = operations[op]?.asm ?? op.toString(10);
        const addr = green(`0x${ip.toString(16).padStart(4, '0')}`);
        const cmd = cmdTemplate.split(' ').map((part, i) =>
            i == 0 ? cyan(part) :
            i == 1 ? stArg(memory[ip + 1]) :
            i == 2 ? stArg(memory[ip + 2]) :
            i == 3 ? stArg(memory[ip + 3]) :
                (() => {
                    throw new Error()
                })()
        ).join(' ');
        res += `${addr}  ${cmd}\n`;
        ip += cmdTemplate.split(' ').length;
    }
    return res;
}

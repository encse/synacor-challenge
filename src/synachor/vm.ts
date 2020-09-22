import * as fs from "fs";
import {disassemble} from "./disassembler";
import {operations, OperationResult} from "./operations";

export class Vm {
    public readonly memory = new Uint16Array(65536);
    public tracing = false;
    public output: string = '';
    public input: string = '';

    constructor() {
        this.ip = 0;
        this.sp = 65535;
    }

    public get ax(): number {
        return this.memory[0x8000];
    }

    public set ax(num: number) {
        this.memory[0x8000] = num;
    }

    public get bx(): number {
        return this.memory[0x8001];
    }

    public set bx(num: number) {
        this.memory[0x8001] = num;
    }

    public get cx(): number {
        return this.memory[0x8002];
    }

    public set cx(num: number) {
        this.memory[0x8002] = num;
    }

    public get dx(): number {
        return this.memory[0x8003];
    }

    public set dx(num: number) {
        this.memory[0x8003] = num;
    }

    public get ex(): number {
        return this.memory[0x8004];
    }

    public set ex(num: number) {
        this.memory[0x8004] = num;
    }

    public get fx(): number {
        return this.memory[0x8005];
    }

    public set fx(num: number) {
        this.memory[0x8005] = num;
    }

    public get gx(): number {
        return this.memory[0x8006];
    }

    public set gx(num: number) {
        this.memory[0x8006] = num;
    }

    public get hx(): number {
        return this.memory[0x8007];
    }

    public set hx(num: number) {
        this.memory[0x8007] = num;
    }

    public get ip(): number {
        return this.memory[0x8008];
    }

    public set ip(num: number) {
        this.memory[0x8008] = num;
    }

    public get sp(): number {
        return this.memory[0x8009];
    }

    public set sp(num: number) {
        this.memory[0x8009] = num;
    }

    public save(file: string) {
        fs.writeFileSync(file, this.memory);
    }

    public load(file: string) {
        const prog = fs.readFileSync(file);
        const challenge = new Uint16Array(prog.buffer, 0, prog.buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT);
        this.memory.set(challenge, 0);
    }

    public pop() {
        return this.memory[++this.sp]
    }

    public push(val: number) {
        this.memory[this.sp--] = val;
    }

    public run(input: string): { output: string, stop: boolean } {
        this.input = input;
        this.output = '';
        let operationResult = OperationResult.Continue;
        while (operationResult === OperationResult.Continue) {
            if (this.tracing) {
                this.output += disassemble(this.memory, this.ip, 1);
            }

            let opcode = this.memory[this.ip];
            const operation = operations[opcode];
            if (operation == null) {
                this.output += `invalid instruction ${opcode} at ${this.ip.toString(16)}\n`;
                operationResult = OperationResult.Stop;
            } else {
                operationResult = operation.process(this);
            }
        }

        return {output: this.output, stop: operationResult === OperationResult.Stop};
    }

}
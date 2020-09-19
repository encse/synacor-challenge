import * as fs from "fs";


function asm(strings: TemplateStringsArray, ...args: number[]): {st: string, length: number}  {
	let str = '';
	strings.forEach((string, i) => {
		str += string;
		if (args[i] != null) {
			str += (args[i] < 32768 ? args[i].toString(16) : "abcdefgh"[args[i]-32768]+'x');
		}
	});
	return {st: str, length: args.length +1};
}



export class Machine {
	public readonly memory: Uint16Array;
	public tracing = false;

	get ax(): number {
		return this.memory[0x8000];
	}

	set ax(num: number) {
		this.memory[0x8000] = num;
	}

	get bx(): number {
		return this.memory[0x8001];
	}

	set bx(num: number) {
		this.memory[0x8001] = num;
	}

	get cx(): number {
		return this.memory[0x8002];
	}

	set cx(num: number) {
		this.memory[0x8002] = num;
	}

	get dx(): number {
		return this.memory[0x8003];
	}

	set dx(num: number) {
		this.memory[0x8003] = num;
	}

	get ex(): number {
		return this.memory[0x8004];
	}

	set ex(num: number) {
		this.memory[0x8004] = num;
	}

	get fx(): number {
		return this.memory[0x8005];
	}

	set fx(num: number) {
		this.memory[0x8005] = num;
	}

	get gx(): number {
		return this.memory[0x8006];
	}

	set gx(num: number) {
		this.memory[0x8006] = num;
	}

	get hx(): number {
		return this.memory[0x8007];
	}

	set hx(num: number) {
		this.memory[0x8007] = num;
	}

	get ip(): number {
		return this.memory[0x8008];
	}

	set ip(num: number) {
		this.memory[0x8008] = num;
	}

	get sp(): number {
		return this.memory[0x8009];
	}

	set sp(num: number) {
		this.memory[0x8009] = num;
	}

	push(val: number): void {
		this.memory[this.sp--] = val;
	}

	pop(): number {
		return this.memory[++this.sp];
	}

	constructor() {
		this.memory = new Uint16Array(65536);
		this.ip = 0;
		this.sp = 65535;
	}

	public save(file: string) {
		fs.writeFileSync(file, this.memory);
	}

	public load(file: string) {
		const prog = fs.readFileSync(file);
		const challenge = new Uint16Array(prog.buffer, 0, prog.buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT);
		this.memory.set(challenge, 0);
	}

	private read(num: number): number {
		const val = this.memory[num];
		return val < 32768 ? val : this.memory[val];
	}


	public run(input: string): { output: string, stop: boolean } {

		let output: string = '';

		while (true) {
			let cmd = (this.memory)[this.ip];
			let arg1 = (this.memory)[this.ip + 1];
			if (this.tracing) {
				this.disasm(this.ip, 1);
			}
			switch (cmd) {
				case 0:
					return {output, stop: true};
				case 1:
					(this.memory)[arg1] = this.read(this.ip + 2);
					this.ip += 3;
					break;
				case 2:
					this.push(this.read(this.ip + 1));
					this.ip += 2;
					break;
				case 3:
					(this.memory)[arg1] = this.pop();
					this.ip += 2;
					break;
				case 4:
					(this.memory)[arg1] = this.read(this.ip + 2) == this.read(this.ip + 3) ? 1 : 0;
					this.ip += 4;
					break;
				case 5:
					(this.memory)[arg1] = this.read(this.ip + 2) > this.read(this.ip + 3) ? 1 : 0;
					this.ip += 4;
					break;
				case 6:
					this.ip = this.read(this.ip + 1);
					break;
				case 7:
					this.ip = this.read(this.ip + 1) != 0 ? this.read(this.ip + 2) : this.ip + 3;
					break;
				case 8:
					this.ip = this.read(this.ip + 1) == 0 ? this.read(this.ip + 2) : this.ip + 3;
					break;
				case 9:
					(this.memory)[arg1] = (this.read(this.ip + 2) + this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 10:
					(this.memory)[arg1] = (this.read(this.ip + 2) * this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 11:
					(this.memory)[arg1] = (this.read(this.ip + 2) % this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 12:
					(this.memory)[arg1] = (this.read(this.ip + 2) & this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 13:
					(this.memory)[arg1] = (this.read(this.ip + 2) | this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 14:
					(this.memory)[arg1] = ~this.read(this.ip + 2) & 32767;
					this.ip += 3;
					break;
				case 15:
					(this.memory)[arg1] = (this.memory)[(this.read(this.ip + 2))];
					this.ip += 3;
					break;
				case 16:
					(this.memory)[(this.read(this.ip + 1))] = this.read(this.ip + 2);
					this.ip += 3;
					break;
				case 17:
					this.push(this.ip + 2);
					this.ip = this.read(this.ip + 1);
					break;
				case 18:
					this.ip = this.pop();
					break;
				case 19:
					output += String.fromCharCode(this.read(this.ip + 1));
					this.ip += 2;
					break;
				case 20:
					if (input.length > 0) {
						(this.memory)[arg1] = input.charCodeAt(0);
						input = input.substring(1);
						this.ip += 2;
					} else {
						return {output, stop: false};
					}
					break;
				case 21:
					this.ip++;
					break;
				default:
					console.error("invalid instruction", cmd);
					return {output, stop: true};
			}
		}
	}

	public disasm(ip: number, length: number): string {

		let res = '';
		for (let i = 0; i < length; i++) {
			let cmd = (this.memory)[ip];
			let arg1 = (this.memory)[ip + 1];
			let arg2 = (this.memory)[ip + 2];
			let arg3 = (this.memory)[ip + 3];
			let asmString: { st: string, length: number };
			switch (cmd) {
				case 0:
					asmString = asm`break`;
					break;
				case 1:
					asmString = asm`set ${arg1} ${arg2}`;
					break;
				case 2:
					asmString = asm`push ${arg1}`;
					break;
				case 3:
					asmString = asm`pop ${arg1}`;
					break;
				case 4:
					asmString = asm`eq ${arg1} ${arg2} ${arg3}`;
					break;
				case 5:
					asmString = asm`gt ${arg1} ${arg2} ${arg3}`;
					break;
				case 6:
					asmString = asm`jmp ${arg1}`;
					break;
				case 7:
					asmString = asm`jt ${arg1} ${arg2}`;
					break;
				case 8:
					asmString = asm`jf ${arg1} ${arg2}`;
					break;
				case 9:
					asmString = asm`add ${arg1} ${arg2} ${arg3}`;
					break;
				case 10:
					asmString = asm`mul ${arg1} ${arg2} ${arg3}`;
					break;
				case 11:
					asmString = asm`mod ${arg1} ${arg2} ${arg3}`;
					break;
				case 12:
					asmString = asm`and ${arg1} ${arg2} ${arg3}`;
					break;
				case 13:
					asmString = asm`or ${arg1} ${arg2} ${arg3}`;
					break;
				case 14:
					asmString = asm`not ${arg1} ${arg2}`;
					break;
				case 15:
					asmString = asm`rmem ${arg1} ${arg2}`;
					break;
				case 16:
					asmString = asm`wmem ${arg1} ${arg2}`;
					break;
				case 17:
					asmString = asm`call ${arg1}`;
					break;
				case 18:
					asmString = asm`ret`;
					break;
				case 19:
					asmString = asm`out ${arg1}`;
					break;
				case 20:
					asmString = asm`in ${arg1}`;
					break;
				case 21:
					asmString = asm`nop`;
					break;
				default:
					asmString = {st: cmd.toString(10), length: 1};
					break;
			}

			res += `0x${ip.toString(16).padStart(4, '0')} ${asmString.st}\n`;
			ip += asmString.length;
		}
		return res;
	}

}

function ansiBlock(num: number) {
	return (strings: TemplateStringsArray, ...values: any[]): string => {
		let s = strings[0];
		for (let i = 0; i < values.length; i++) {
			s += values[i];
			s += strings[i+1];
		}
		return `\x1b[${num}m` + s + '\x1b[0m';
	}
}

export const inverse = ansiBlock(7);
export const bold = ansiBlock(1);
export const black = ansiBlock(30);
export const red = ansiBlock(31);
export const green = ansiBlock(32);
export const yellow = ansiBlock(33);
export const blue = ansiBlock(34);
export const magenta = ansiBlock(35);
export const cyan = ansiBlock(36);
export const white = ansiBlock(37);

export function stripMargin(strings: TemplateStringsArray, ...values: any[]): string {
	let s = strings[0];
	for (let i = 0; i < values.length; i++) {
		s += values[i];
		s += strings[i+1];
	}
	return (s
			.split("\n")
			.filter(line => line.match(/^\s*\| /))
			.map(line => line.replace(/^\s*\| /, ""))
			.join('\n')
	);
}


export class Writer {

	constructor(private getHighlight: () => string[]) {
	}

	public writeln(st: string) {
		this.write(st + '\n');
	}

	public write(chars: string): void {
		const lines = chars.split('\n');
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.startsWith("==")) {
				line = bold`${line}`;
			}
			for (const keyword of this.getHighlight()) {
				line = line.replace(new RegExp("\\b" + keyword + "\\b", "g"), bold`${keyword}`);
			}
			if (i < lines.length - 1) {
				line += '\n';
				for (let i=0;i<10000000;i++){
					; //spin
				}
			}
			process.stdout.write(line);
		}
	}

}
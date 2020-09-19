
export function bold(strings: TemplateStringsArray, ...values: any[]): string {
	let s = strings[0];
	for (let i = 0; i < values.length; i++) {
		s += values[i];
		s += strings[i+1];
	}
	return '\x1b[1m' + s + '\x1b[0m';
}

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

	public writeLn(st: string) {
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
			}
			process.stdout.write(line);

		}

	}

}
function ansiBlock(num: number) {
    return (strings: TemplateStringsArray, ...values: any[]): string => {
        let s = strings[0];
        for (let i = 0; i < values.length; i++) {
            s += values[i];
            s += strings[i + 1];
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
        s += strings[i + 1];
    }
    return (s
            .split("\n")
            .filter(line => line.match(/^\s*\| /))
            .map(line => line.replace(/^\s*\| /, ""))
            .join('\n')
    );
}


export class Writer {

    constructor(private getWordsToHighlight: () => string[]) {
    }

    public writeln(st: string) {
        this.write(st + '\n');
    }

    public write(chars: string): void {

        let lines = chars.split("\n");
        lines = this.lineBreak(lines, 80);
        lines = this.highlight(lines, [
            "(==.*==)",
            ...this.getWordsToHighlight().map(word => `\\b(${word})\\b`)
        ]);

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (i < lines.length - 1) {
                line += '\n';
                for (let i = 0; i < 10000000; i++) {
                    ; // ugly spin
                }
            }
            process.stdout.write(line);
        }
    }

    private lineBreak(lines: string[], width: number): string[] {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let ichSpace = 0;
            let escape = false;
            let nonEscapedChars = 0;
            for (let ich = 0; ich < line.length; ich++) {
                if (escape) {
                    if (line[ich] == ';') {
                        escape = false;
                    }
                } else {
                    if (line[ich] == '\x1b') {
                        escape = true;
                    } else {
                        nonEscapedChars++;
                        if (line[ich] == ' ') {
                            ichSpace = ich;
                        }
                        if (nonEscapedChars > width) {
                            if (ichSpace > 0) {
                                lines.splice(i + 1, 0, line.substring(ichSpace + 1));
                                lines[i] = line.substring(0, ichSpace).trimRight();
                            }
                            break;
                        }
                    }
                }
            }
        }
        return lines;
    }

    private highlight(lines: string[], highlights: string[]): string[] {
        for (let i = 0; i < lines.length; i++) {
            for (let h of highlights) {
                lines[i] = lines[i].replace(new RegExp(h, "g"), bold`$1`);
            }
        }
        return lines;
    }
}
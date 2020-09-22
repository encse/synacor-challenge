import readline, {Interface} from "readline";

export class Reader {
    rl: Interface;

    constructor(getWords: () => string[]) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            completer: (line: string) => {
                const words = getWords();
                for (let i = 0; i < line.length; i++) {
                    if (i == 0 || line[i - 1] == ' ') {
                        const substring = line.substring(i);

                        const matches = words.filter(word => word.startsWith(substring));
                        if (matches.length > 0) {
                            return [matches, substring];

                        }
                    }
                }
                return [[], line];
            }
        });
    }

    async question(prompt: string) {
        return new Promise(resolve => this.rl.question(prompt, resolve));
    }
}
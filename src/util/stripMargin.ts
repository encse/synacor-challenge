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
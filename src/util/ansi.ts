function ansiBlock(num: number) {
    return (st: any): string => {
        return `\x1b[${num}m${st}\x1b[0m`;
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
export const clearScreen = '\x1b[2J';
export const goHome = '\x1b[H';
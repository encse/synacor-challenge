
type CmdArg = "<number>" | "<string>"
type MapArg<V> =  V extends "<number>" ? number : V extends "<string>" ? string : never;

type MapArgs<Tuple extends [...any[]]> =  {[Index in keyof Tuple]: MapArg<Tuple[Index]>;}

export type Cmd = {name: string, do: (line: string) => boolean};

export function command<K extends CmdArg[]>(
	regex: [string, ...K],
	on: (...args: [...MapArgs<K>]) => void
): Cmd {
	const matchString = new RegExp(
		"^" +
		regex[0] +
		regex.slice(1).map(
			arg =>
				arg === "<string>" ? "\\s+(.*)" :
				arg === "<number>" ? "\\s+(0x[0-9a-f]+|\\d+)" :
				(() => {throw new Error("")})()
		).join("") +
		"\n"
	);

	return {
		name: regex[0],
		do: (line) => {

			const match = line.match(matchString);
			if (match != null) {
				const args = match.slice(1).map((st, i) => {
					if (regex[i + 1] == "<number>") {
						return st.startsWith("0x") ? parseInt(st.substring(2), 16) : parseInt(st, 10);
					} else {
						return st
					}
				});
				try {
					(on as any)(...args);
				} catch (e) {
					console.error(e);
				}
				return true;
			}
			return false;
		}
	}
}
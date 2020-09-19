import {stripMargin, Writer} from "./writer";

export function solveMaze(writer: Writer) {
	const maze = [
		['*', 8, '-', 1],
		[4, '*', 11, '*'],
		['+', 4, '-', 18],
		[22, '-', 9, '*']
	];


	writer.writeLn(stripMargin`
		| 
		| 
		| == Solving the maze ==
		| You take a piece of paper and sketch the layout of the maze:
		| 
	`);

	for (const line of maze) {
		writer.write("          ");
		for (const col of line) {
			writer.write(`${col}`.padStart(4, ' '));
		}
		writer.write("\n");
	}

	writer.writeLn(stripMargin`
		| 
		| The maze is like a big calculator device. You start at 22 and every other step modifies the value.
		| 
		| With some trial and error you find the shortest path that ends in the top right corner with the value 30.
		| You need to go:
	`);

	let pos = {irow: 3, icol: 0, num: 22, steps: [] as string[]};
	const queue = [pos];
	let seen = new Set<string>();
	while (queue.length > 0) {
		pos = queue.shift()!;
		let key = `${pos.irow},${pos.icol},${pos.num}`;
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);

		if (pos.icol == 3 && pos.irow == 0) {
			if (pos.num == 30) {
				writer.writeLn("    " + pos.steps.join(", "));
				break;
			}
		} else {

			for (let {drow, dcol, dir} of [
				{drow: -1, dcol: 0, dir: "north"},
				{drow: 1, dcol: 0, dir: "south"},
				{drow: 0, dcol: -1, dir: "west"},
				{drow: 0, dcol: 1, dir: "east"},
			]) {
				let icol = pos.icol + dcol;
				let irow = pos.irow + drow;
				if (icol < 0 || irow < 0 || icol > 3 || irow > 3) {
					continue;
				}

				// can't go back to start room
				if (icol == 0 && irow == 3) {
					continue;
				}
				if (pos.steps.length == 12) {
					continue;
				}
				let num = pos.num;
				const v = maze[irow][icol];
				if (typeof v == "number") {
					switch (maze[pos.irow][pos.icol]) {
						case '+':
							num += v;
							break;
						case '-':
							num -= v;
							break;
						case '*':
							num *= v;
							break;
						default:
							throw new Error();
					}
				}
				queue.push({irow, icol, num, steps: [...pos.steps, dir]});
			}
		}
	}
}
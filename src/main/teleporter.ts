import {stripMargin, Writer} from "./writer";
import {Machine} from "./machine";

export function hackTeleporter(writer: Writer, machine: Machine) {
	const createA = (h: number): number[][] => {
		let A:number[][] = [];
		for (let m=0;m<0x5;m++) {
			let row:number[] = [];
			A[m] = row;
			for (let n=0;n<0x8000;n++) {
				if (m == 4 && n == 2) {
					return A;
				}
				if (m == 0) {
					row.push((n + 1) & 0x7fff);
				} else if(n == 0){
					row.push(A[m-1][h]);
				} else {
					row.push(A[m - 1][A[m][n - 1]]);
				}
			}
		}
		return A;
	};

	writer.writeLn(stripMargin`
		| == Hacking the teleporter ==
		| You start examining the teleporter. There is a opening on one side where
		| you attach your hacking device.
		|
		| After some exploration you find the following assembly snippet
	`);
	writer.write(machine.disasm(0x1566, 20));

	writer.writeLn(stripMargin`
		| 
		| This must be related to the check mechanism. It seems that the expected result
		| is 6 and the costy calculation is triggered by the call at 0x1571.
		|
		| You patch the routine as:
	`);

	machine.memory[0x156d] = 6;
	machine.memory[0x1571] = 21;
	machine.memory[0x1572] = 21;
	writer.write(machine.disasm(0x156b, 5));

	writer.writeLn(stripMargin`
		| 
		| Now you just have to find the right setting for the eighth register.
		| You need a value that would make the costy calculation return 6, this is going to take a while...
		| 
		| Searching for seed...
	`);

	for (let hx=0; hx <= 0xffff; hx++) {
		const A = createA(hx);
		writer.write(`\rhx = 0x${hx.toString(16)}`);

		if (A[4][1] === 6) {
			writer.writeLn("");
			machine.hx = hx;
			break;
		}
	}
}
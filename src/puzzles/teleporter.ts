import {bold, stripMargin, Writer} from "../io/writer";
import {Vm} from "../synachor/vm"
import {constant, disassemble, reg} from "../synachor/disassembler";
import {checkPrecondition} from "./check";

export function hackTeleporter(writer: Writer, location: string, things: string[], vm: Vm) {

    if (!checkPrecondition(
        location, ["Synacor Headquarters"],
        things, ["teleporter"],
        writer
    )) {
        return;
    }

    const createAckermannTable = (h: number): number[][] => {
        let ackermann: number[][] = [];
        for (let m = 0; m < 0x5; m++) {
            let row: number[] = [];
            ackermann[m] = row;
            for (let n = 0; n < 0x8000; n++) {
                if (m == 4 && n == 2) {
                    return ackermann;
                }
                if (m == 0) {
                    row.push((n + 1) & 0x7fff);
                } else if (n == 0) {
                    row.push(ackermann[m - 1][h]);
                } else {
                    row.push(ackermann[m - 1][ackermann[m][n - 1]]);
                }
            }
        }
        return ackermann;
    };

    writer.writeln(stripMargin`
		| 
		| 
		| You start examining the teleporter. There is a opening on the side where you can stick in your hacking device.
		| 
		| The device beeps and starts examing the memory. 
		| 
		| After some exploration you find the following assembly snippet:
		| 
	`);
    writer.write(disassemble(vm.memory, 0x1566, 20));

    writer.writeln(stripMargin`
		| 
		| This must be related to the confirmation process. It seems that the expected result is ${bold`6`} and the process is triggered by the call at ${constant(0x1571)}.
		|
		| You patch the routine as:
		| 
	`);

    vm.memory[0x156d] = 6;
    vm.memory[0x1571] = 21;
    vm.memory[0x1572] = 21;
    writer.write(disassemble(vm.memory, 0x156b, 5));

    writer.writeln(stripMargin`
		| 
		| Now you just have to find the right setting for the eighth register.
		| You need a value that would make the calculation return 6, this can take a while...
		| 
		| Searching for seed...
	`);

    for (let hx = 0; hx <= 0xffff; hx++) {
        const ackermann = createAckermannTable(hx);
        writer.write(`\r${reg('hx')} = ${constant(hx)}`);

        if (ackermann[4][1] === 6) {
            writer.writeln("");
            vm.hx = hx;
            break;
        }
    }

    writer.writeln(stripMargin`
		| 
		| All set, go ahead.
	`);

}
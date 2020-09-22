import {Vm} from "./vm";

export enum OperationResult {
    Continue,
    Break,
    Stop,
}

export type Operation = { asm: string, process: (vm: Vm) => OperationResult }

function readMem(vm: Vm, addr: number) {
    const val = vm.memory[addr];
    return val < 32768 ? val : vm.memory[val];
}

function addr1(vm: Vm) {
    return vm.memory[vm.ip + 1];
}

function val1(vm: Vm) {
    return readMem(vm, vm.ip + 1);
}

function val2(vm: Vm) {
    return readMem(vm, vm.ip + 2);
}

function val3(vm: Vm) {
    return readMem(vm, vm.ip + 3);
}

export const operations: Operation[] = [
    {
        asm: "break",
        process: () => OperationResult.Stop
    },
    {
        asm: "set <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = val2(vm);
            vm.ip += 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "push <arg1>",
        process: (vm: Vm) => {
            vm.push(val1(vm));
            vm.ip += 2;
            return OperationResult.Continue;
        }
    },
    {
        asm: "pop <arg1>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = vm.pop();
            vm.ip += 2;
            return OperationResult.Continue;
        }
    },
    {
        asm: "eq <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = val2(vm) === val3(vm) ? 1 : 0;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "gt <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = val2(vm) > val3(vm) ? 1 : 0;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "jmp <arg1>",
        process: (vm: Vm) => {
            vm.ip = val1(vm);
            return OperationResult.Continue;
        }
    },
    {
        asm: "jt <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.ip = val1(vm) != 0 ? val2(vm) : vm.ip + 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "jf <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.ip = val1(vm) == 0 ? val2(vm) : vm.ip + 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "add <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = (val2(vm) + val3(vm)) & 32767;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "mul <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = (val2(vm) * val3(vm)) & 32767;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "mod <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = (val2(vm) % val3(vm)) & 32767;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "and <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = (val2(vm) & val3(vm)) & 32767;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "or <arg1> <arg2> <arg3>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = (val2(vm) | val3(vm)) & 32767;
            vm.ip += 4;
            return OperationResult.Continue;
        }
    },
    {
        asm: "not <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = ~val2(vm) & 32767;
            vm.ip += 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "rmem <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.memory[addr1(vm)] = vm.memory[val2(vm)];
            vm.ip += 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "wmem <arg1> <arg2>",
        process: (vm: Vm) => {
            vm.memory[val1(vm)] = val2(vm);
            vm.ip += 3;
            return OperationResult.Continue;
        }
    },
    {
        asm: "call <arg1>",
        process: (vm: Vm) => {
            vm.push(vm.ip + 2);
            vm.ip = val1(vm);
            return OperationResult.Continue;
        }
    },
    {
        asm: "ret",
        process: (vm: Vm) => {
            vm.ip = vm.pop();
            return OperationResult.Continue;
        }
    },
    {
        asm: "out <arg1>",
        process: (vm: Vm) => {
            vm.output += String.fromCharCode(val1(vm));
            vm.ip += 2;
            return OperationResult.Continue;
        }
    },
    {
        asm: "in <arg1>",
        process: (vm: Vm) => {
            if (vm.input.length > 0) {
                vm.memory[addr1(vm)] = vm.input.charCodeAt(0);
                vm.input = vm.input.substring(1);
                vm.ip += 2;
                return OperationResult.Continue;
            } else {
                return OperationResult.Break;
            }
        }
    },
    {
        asm: "nop",
        process: (vm: Vm) => {
            vm.ip++;
            return OperationResult.Continue;
        }
    },
];

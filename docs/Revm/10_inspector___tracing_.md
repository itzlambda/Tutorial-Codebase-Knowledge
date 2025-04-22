# Chapter 10: Inspector & Tracing

Welcome back! In the previous chapter, [Handler & Execution Loop](09_handler___execution_loop_.md), we saw how the EVM manages the full lifecycle of transaction execution, coordinating calls, gas, and state changes. Now, it's time to explore a very powerful tool for developers and analysts: the **Inspector & Tracing** system in `revm`.

---

## Why Do We Need an Inspector & Tracing?

Imagine you’re learning to drive a car. At first, you just want to press the gas and steer, but as you get better, you might want to watch a special dashboard that shows exactly how your car behaves:

- How fast you are now,
- How much fuel you’re using,
- When you press the brake or accelerator,
- Which gear you’re in,
- And even a replay of your trip step-by-step.

Similarly, when running smart contracts inside the EVM, it’s super useful to **peek inside the “engine”** to see exactly what happens at every execution step:

- Which instructions run,
- What’s on the stack,
- When logs are generated,
- Calls and creations made,
- How gas is spent,
- And even to modify behavior for debugging or analysis.

This is what the **Inspector & Tracing system** in `revm` provides — **debugging hooks and tracing points into the EVM execution engine**.

---

## Central Use Case: Debugging a Smart Contract Execution

Suppose you wrote a contract but it behaves unexpectedly — maybe it runs out of gas prematurely, or a conditional jump goes to the wrong place, or logs aren’t emitted correctly.

With a simple call, you want to:

1. Step through your contract code instruction-by-instruction,
2. See the stack and memory state at each point,
3. Observe when logs or calls happen,
4. Track gas usage in detail,
5. And if needed, stop or modify execution at certain points.

The **Inspector** lets you hook into all these steps easily, like attaching a debugger or a monitoring system to your EVM execution.

---

## Breaking Down the Inspector & Tracing System

Let's break it into beginner-friendly parts:

### 1. **Inspector Trait**

- A *trait* (or interface) that you implement to get notifications about EVM execution.
- It provides methods called at key moments such as:
  - When the interpreter initializes,
  - Before and after every instruction,
  - When a log is emitted,
  - When a call or contract creation starts or ends,
  - When a contract self-destructs.
- You can log, store, analyze or even modify execution flow in these hooks.

### 2. **Hooks During Execution**

- **Initialize Interp**: Called once before code execution starts.
- **Step**: Called before executing every instruction.
- **Step End**: Called right after each instruction finishes.
- **Log**: Called whenever an event log is emitted.
- **Call**: Called before a new contract call or creation.
- **Call End**: Called right after the call finishes.
- **Create** & **Create End**: Similar to call hooks for contract creation.
- **Selfdestruct**: Called when a contract self-destructs.

### 3. **Integration with EVM**

- The `Inspector` is plugged into the EVM runtime.
- `revm` calls inspector hooks automatically during execution.
- Multiple inspectors can be composed if needed.
- Even though powerful, these hooks are optional, so normal execution remains fast without them.

### 4. **Journal Extensions**

- The inspector also works closely with the **state journaling system** to access logs and state changes.
- Inspector can read these journals to obtain detailed info about execution.

---

## How to Use the Inspector in Practice

Here’s a super simple example of implementing a basic inspector that logs each executed instruction:

```rust
use revm::{
    interpreter::{Interpreter, EthInterpreter, InterpreterTypes},
    inspector::Inspector,
};
use context::Context;
use primitives::U256;

struct SimpleLogger;

impl<CTX> Inspector<CTX, EthInterpreter> for SimpleLogger {
    fn step(&mut self, interp: &mut Interpreter<EthInterpreter>, _ctx: &mut CTX) {
        let pc = interp.bytecode.pc();
        let opcode = interp.current_opcode();
        let stack = &interp.stack;
        println!(
            "Executing instruction at PC {}: opcode 0x{:x}, Stack size: {}",
            pc,
            opcode,
            stack.len()
        );
    }

    fn log(&mut self, _interp: &mut Interpreter<EthInterpreter>, _ctx: &mut CTX, log: primitives::Log) {
        println!("Log emitted: {:?}", log);
    }
}
```

**Explanation:**

- We define `SimpleLogger` struct.
- It implements the `Inspector` trait.
- On every instruction step, it prints program counter, opcode, and current stack size.
- When a log is emitted, it prints the log info.

### Plugging the Inspector into your EVM:

```rust
let mut context = Context::new(EmptyDB, SpecId::LATEST);
// ... set up context with transaction and block ...

// Create your EVM runtime with your inspector
let mut evm = context.build_mainnet_with_inspector(SimpleLogger);

// Run your EVM with inspector enabled!
let _ = evm.inspect_replay();
```

> This will print every instruction and emitted log during contract execution, helping you understand what’s happening inside!

---

## What Happens Internally? Step-by-Step Inspection Flow

```mermaid
sequenceDiagram
    participant EVM as EVM Interpreter
    participant Inspector as Inspector Hooks
    participant Context as Blockchain Context & Journal

    EVM->>Inspector: initialize_interp()
    loop For every instruction
        EVM->>Inspector: step() - before instruction
        EVM->>EVM: execute instruction
        EVM->>Inspector: step_end() - after instruction
        alt Instruction emits a log
            EVM->>Inspector: log()
        end
    end
    alt Contract call or create
        EVM->>Inspector: call()/create()
        [Execution of called contract]
        EVM->>Inspector: call_end()/create_end()
    end
    alt Contract selfdestruct
        EVM->>Inspector: selfdestruct()
    end
```

### Explanation:

- Before the interpreter starts, Inspector’s `initialize_interp` is called.
- For each instruction:
  - `step` is called to inspect before execution.
  - Interpreter runs the instruction.
  - `step_end` is called after execution.
- If the instruction emits a log, `log` is called.
- When a contract call or creation starts and ends, respective hooks are invoked.
- If a contract selfdestructs, the inspector gets notified with the contract and target info.

---

## Diving Deeper into the Code: Core Inspector Trait

From the file `crates/inspector/src/inspector.rs`:

```rust
pub trait Inspector<CTX, INTR: InterpreterTypes = EthInterpreter> {
    fn initialize_interp(&mut self, interp: &mut Interpreter<INTR>, context: &mut CTX) { }
    fn step(&mut self, interp: &mut Interpreter<INTR>, context: &mut CTX) { }
    fn step_end(&mut self, interp: &mut Interpreter<INTR>, context: &mut CTX) { }
    fn log(&mut self, interp: &mut Interpreter<INTR>, context: &mut CTX, log: Log) { }
    fn call(&mut self, context: &mut CTX, inputs: &mut CallInputs) -> Option<CallOutcome> { None }
    fn call_end(&mut self, context: &mut CTX, inputs: &CallInputs, outcome: &mut CallOutcome) { }
    fn create(&mut self, context: &mut CTX, inputs: &mut CreateInputs) -> Option<CreateOutcome> { None }
    fn create_end(&mut self, context: &mut CTX, inputs: &CreateInputs, outcome: &mut CreateOutcome) { }
    fn selfdestruct(&mut self, contract: Address, target: Address, value: U256) { }
    // Other hooks omitted for brevity...
}
```

- All methods have default empty implementations.
- You override the ones relevant for your use case.
- Returning something from `call` or `create` can override the execution result (helpful for debugging or simulating).

---

## How Inspector Integrates with the Handler & Execution Loop

The handler in `revm` supports an `InspectorHandler` trait, which extends the normal `Handler` with inspector hooks.

When running the EVM with inspection enabled:

- The handler calls **inspector-aware versions** of execution functions.
- The interpreter calls the `step` and `step_end` hooks during its instruction loop.
- The inspector also receives call and create notifications for better visibility into nested executions.

Here’s a simplified snippet from `crates/inspector/src/handler.rs` showing how the inspector is called during the frame execution loop:

```rust
fn inspect_run_exec_loop(
    &mut self,
    evm: &mut Self::Evm,
    frame: Self::Frame,
) -> Result<FrameResult, Self::Error> {
    let mut frame_stack: Vec<Self::Frame> = vec![frame];
    loop {
        let frame = frame_stack.last_mut().unwrap();
        let call_or_result = self.inspect_frame_call(frame, evm)?;

        let result = match call_or_result {
            ItemOrResult::Item(mut init) => {
                if let Some(output) = frame_start(context, inspector, &mut init) {
                    output
                } else {
                    // create sub frame...
                }
            }
            ItemOrResult::Result(mut result) => {
                frame_end(context, inspector, frame.frame_input(), &mut result);
                frame_stack.pop();
                result
            }
        };

        // returning results to caller frame or exit when no frames remain...
    }
}
```

- Before and after each frame execution, the inspector’s call or create hooks are activated.
- The interpreter steps inside frames call inspector's `step` and `step_end`.
- Logs and selfdestructs trigger inspector calls too.

---

## Advanced Tip: Using the Inspector for Gas Profiling

There is also a `GasInspector` in `crates/inspector/src/gas.rs` that tracks gas usage step-by-step.

Example usage snippet:

```rust
struct GasProfiler {
    last_gas: u64,
}

impl<CTX> Inspector<CTX, EthInterpreter> for GasProfiler {
    fn initialize_interp(&mut self, interp: &mut Interpreter<EthInterpreter>, _ctx: &mut CTX) {
        self.last_gas = interp.control.gas().remaining();
    }

    fn step_end(&mut self, interp: &mut Interpreter<EthInterpreter>, _ctx: &mut CTX) {
        let current_gas = interp.control.gas().remaining();
        let spent = self.last_gas - current_gas;
        println!("Gas spent on this instruction: {}", spent);
        self.last_gas = current_gas;
    }
}
```

This helps analyze which instructions consume the most gas in your contract execution.

---

## Summary

In this chapter, you learned:

- **What is Inspector & Tracing?**  
  A system of hooks providing detailed introspection into EVM execution, like a debugger and system monitor.

- **Why is it useful?**  
  To debug, profile, and analyze smart contract execution step-by-step.

- **Key Concepts:**  
  Inspector trait hooks (`step`, `step_end`, `log`, `call`, `create`, `selfdestruct`), integration with interpreter and handler, journal extensions.

- **How to use it:**  
  Implement the `Inspector` trait for your struct, override desired hooks, and plug it into your EVM runtime.

- **What happens internally:**  
  Inspector methods are called at appropriate execution events, allowing custom logic to observe or modify EVM execution flow.

- **How it fits into `revm` architecture:**  
  Works closely with the interpreter, handler, context, and journaling layers to give you a full view of running contracts.

---

## What’s Next?

You now have a powerful tool to peek into EVM execution. With inspectors, you can trace, debug, and understand smart contracts like never before!

The next chapters may explore optional tooling, integrations, or focus on performance aspects.

Thank you for following along in this exciting journey through `revm` — your window into the Ethereum Virtual Machine internals!

Happy debugging! 🚀

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)
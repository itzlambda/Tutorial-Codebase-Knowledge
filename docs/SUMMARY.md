# Summary

- [Revm](./revm/index.md)
  - [Context & Environment](./revm/01_context___environment_.md)
  - [Host Interface](./revm/02_host_interface_.md)
  - [State & Database Layers](./revm/03_state___database_layers_.md)
  - [Gas Management](./revm/04_gas_management_.md)
  - [Bytecode & Opcodes](./revm/05_bytecode___opcodes_.md)
  - [Precompiles](./revm/06_precompiles_.md)
  - [Interpreter](./revm/07_interpreter_.md)
  - [Frame & Call Handling](./revm/08_frame___call_handling_.md)
  - [Handler & Execution Loop](./revm/09_handler___execution_loop_.md)
  - [Inspector & Tracing](./revm/10_inspector___tracing_.md)
- [Snapchain](./snapchain/index.md)
  - [SnapchainNode and SnapchainReadNode](./snapchain/01_snapchainnode_and_snapchainreadnode_.md)
  - [Configuration and Startup Flow](./snapchain/02_configuration_and_startup_flow_.md)
  - [Network Layer: Gossip, Server, and RPC](./snapchain/03_network_layer__gossip__server__and_rpc_.md)
  - [Mempool and Rate Limits](./snapchain/04_mempool_and_rate_limits_.md)
  - [Consensus Actors (MalachiteConsensusActors, Host, ReadHost, Sync Actors)](./snapchain/05_consensus_actors__malachiteconsensusactors__host__readhost__sync_actors__.md)
  - [Core Protocol Types and Validation](./snapchain/06_core_protocol_types_and_validation_.md)
  - [Stores and Store Trait (e.g., CastStore, LinkStore, ReactionStore)](./snapchain/07_stores_and_store_trait__e_g___caststore__linkstore__reactionstore__.md)
  - [Storage Trie and RocksDB Abstractions](./snapchain/08_storage_trie_and_rocksdb_abstractions_.md)
  - [ShardEngine and BlockEngine (Storage Engines)](./snapchain/09_shardengine_and_blockengine__storage_engines__.md)
- [Malachite](./malachite/index.md)
  - [Core Tendermint Consensus Algorithm](./malachite/01_core_tendermint_consensus_algorithm_.md)
  - [Model-Based Testing and Formal Specifications](./malachite/02_model_based_testing_and_formal_specifications_.md)
  - [Consensus Core Library (Driver, VoteKeeper, Round State Machine)](./malachite/03_consensus_core_library__driver__votekeeper__round_state_machine__.md)
  - [Context Trait and Application Abstractions](./malachite/04_context_trait_and_application_abstractions_.md)
  - [Application State and Proposal Streaming](./malachite/05_application_state_and_proposal_streaming_.md)
  - [Proposal Value Propagation Modes](./malachite/06_proposal_value_propagation_modes_.md)
  - [Consensus Engine and Effect System](./malachite/07_consensus_engine_and_effect_system_.md)
  - [Networking Layer and Gossip Protocol](./malachite/08_networking_layer_and_gossip_protocol_.md)
  - [Write-Ahead Log (WAL) and Crash Recovery](./malachite/09_write_ahead_log__wal__and_crash_recovery_.md)
  - [Actor-based Node Architecture](./malachite/10_actor_based_node_architecture_.md)
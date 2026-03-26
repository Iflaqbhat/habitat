# Run 4 - Re-Review

## Confidence: 2 (Likely there are bugs)

## Comparison to Golden Solution

The AI implements the core file-system-certificate config entry and SDS secret generation, but **omits critical infrastructure changes** that the golden patch includes to properly integrate the new config entry type into Consul's architecture.

### Key Differences (BUGS):

**1. Missing `proxycfg.deepcopy.go` update - CRITICAL BUG**
- **Golden**: Updates `configSnapshotAPIGateway.DeepCopy()` to include `FileSystemCertificates.DeepCopy()`
- **AI**: Does NOT modify this file
- **Impact**: When snapshots are deep-copied (which happens frequently in proxy config handling), the `FileSystemCertificates` map won't be properly cloned. This can cause **race conditions** or **data corruption** when multiple goroutines access snapshot copies.
- **Would fail code review**: Yes - this breaks a codebase invariant. Every field added to the snapshot struct must be handled in DeepCopy.

**2. Missing event streaming infrastructure - BUG**
- **Golden** adds:
  - `EventTopicFileSystemCertificate` in `memdb.go`
  - `configEntryKindToTopic` mapping in `config_entry_events.go`
  - `FileSystemCertificateSnapshot()` function in `config_entry_events.go`
  - Handler registration in `fsm.go`
  - Topic handling in `proxycfg-glue/config_entry.go`
  - Event subscription support in `events.go`
- **AI**: None of these changes
- **Impact**: File-system-certificate config entries won't properly stream updates in multi-node Consul clusters. Changes to certificates won't propagate correctly via the event system.
- **Would fail code review**: Yes - every config entry type needs event streaming support.

**3. Missing `controller_gateways.go` update - BUG**
- **Golden**: Adds `structs.FileSystemCertificate` to the reconciler switch case alongside `structs.InlineCertificate`
- **AI**: Does NOT modify this file
- **Impact**: When a file-system-certificate is created/modified/deleted, the API gateways referencing it won't be properly re-reconciled. Certificate changes may not take effect until gateway restart.
- **Would fail code review**: Yes - breaks the gateway reconciliation pattern.

**4. Missing FSM shadow entries - BUG**
- **Golden**: Adds `ShadowFileSystemCertificateConfigEntry` in `decode_downgrade.go`
- **AI**: Does NOT modify this file
- **Impact**: During cluster upgrades with mixed Consul versions, FSM snapshot handling may fail for file-system-certificate entries.
- **Would fail code review**: Yes - required for upgrade compatibility.

**5. Not renaming `Certificates` to `InlineCertificates` - Minor Issue**
- **Golden**: Renames the field for clarity
- **AI**: Keeps old name `Certificates`
- **Impact**: Confusing naming, but functionally works

### Correct Implementation (matches golden):

1. ✅ `FileSystemCertificateConfigEntry` struct with correct fields
2. ✅ `FileSystemCertificates` watch.Map in snapshot
3. ✅ `handleFileSystemCertConfigUpdate()` handler
4. ✅ `secretsFromSnapshotAPIGateway()` with Envoy filename data sources
5. ✅ Nil entry skipping
6. ✅ Validation logic
7. ✅ `config_entry.go` changes (constants, MakeConfigEntry, AllConfigEntryKinds)

## Edge Cases / Failure Modes

- **Race condition on snapshot copy**: Without DeepCopy fix, concurrent access to FileSystemCertificates during snapshot copies can corrupt data
- **Stale certificates in multi-node clusters**: Without event streaming, certificate updates won't propagate
- **Gateway not updating on cert change**: Without controller_gateways.go fix, gateways won't reconcile when certs change
- **Upgrade failures**: Without FSM shadow entries, cluster upgrades may fail

## Verification

| Requirement | Satisfied |
|-------------|-----------|
| Config entry with Kind, Name, Certificate, PrivateKey, Meta | ✅ |
| Validation (valid paths, metadata, empty paths) | ✅ |
| SDS secrets with filename data source | ✅ |
| Multiple certs → multiple secrets | ✅ |
| Nil entries skipped | ✅ |
| **Proper DeepCopy integration** | ❌ |
| **Event streaming support** | ❌ |
| **Gateway reconciliation on cert change** | ❌ |
| **FSM upgrade compatibility** | ❌ |

## Verdict

**INCORRECT.** The AI implements the core functionality but omits critical infrastructure changes that are required for the config entry to work correctly in production Consul deployments. The missing `proxycfg.deepcopy.go` update alone is a potential race condition bug. The missing event streaming and controller reconciliation changes mean certificate updates won't properly propagate in multi-node clusters. These omissions would definitely be caught in code review as they break established patterns that every other config entry type follows.

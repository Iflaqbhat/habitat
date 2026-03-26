# Invalidate Session Health Checks When Associated Session is Deleted

Implement functionality to automatically invalidate health checks associated with a Consul session when the session is deleted. This feature ensures that session-based health checks reflect the state of their parent session.

## Background

In Consul, sessions can be associated with health checks through the `SessionName` field in the health check definition. When a session is created, any health checks that reference it via `SessionName` should be marked as passing. When a session is destroyed, those same health checks should be automatically marked as critical to reflect that the session is no longer active.

## Requirements

### Session Creation Behavior

When a session is created successfully, the system must:

1. Find all health checks on the same node that:
   - Have `Type` equal to `"session"`
   - Have `Definition.SessionName` matching the session's `Name` field

2. Update each matching health check to:
   - Set `Status` to `api.HealthPassing`
   - Set `Output` to `"Session '<session-id>' in force"` where `<session-id>` is the session's ID

3. The changes must be persisted

### Session Deletion Behavior

When a session is destroyed, the system must:

1. Find all health checks on the same node that:
   - Have `Type` equal to `"session"`
   - Have `Definition.SessionName` matching the session's `Name` field

2. Update each matching health check to:
   - Set `Status` to `api.HealthCritical`
   - Set `Output` to `"Session '<session-id>' is invalid"` where `<session-id>` is the session's ID

3. The changes must be persisted

### Session Validation Behavior

When validating session checks during session creation, the system must allow session creation even if a check with `Type == "session"` is in critical state. This is because session checks are expected to be in critical state before the session exists.

## Edge Cases

- If no matching checks are found, the operation should succeed without error
- The matching logic must consider both check type and session name

<antml:system>
<total_tokens>1000000 tokens left</total_tokens>
<ctx_window>146447 tokens left</ctx_window>
</antml:system>
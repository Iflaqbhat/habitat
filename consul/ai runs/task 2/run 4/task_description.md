# Add file-system-certificate config entry for API gateway

## Overview

Implement support for file-system-certificate configuration entries that allow API gateway listeners to reference TLS certificates and private keys stored as files on the local filesystem. Unlike inline certificates, file-system certificates store file paths instead of certificate content, providing a more secure approach for VM-based deployments.

## Current Behavior

API gateway listeners can only use inline certificates (certificates with embedded certificate and private key content). There is no support for referencing certificates stored as files on the filesystem.

## Required Behavior

### File-System-Certificate Config Entry

A new configuration entry type `file-system-certificate` must be implemented with the following structure:

- **Kind**: Must be set to `"file-system-certificate"`
- **Name**: A unique identifier for the certificate configuration entry
- **Certificate**: A string containing the file path to the public certificate file (e.g., `/opt/consul/tls/api-gateway.crt`)
- **PrivateKey**: A string containing the file path to the private key file (e.g., `/opt/consul/tls/api-gateway.key`)
- **Meta**: Optional map of key-value pairs for metadata

### Config Entry Validation

The file-system-certificate config entry must support the following validation rules:

- A file-system-certificate entry with valid file paths must be accepted
- A file-system-certificate entry with metadata must be accepted
- A file-system-certificate entry with empty certificate and private key paths must be accepted (paths are optional)

### Secret Discovery Service (SDS) Support

For API gateway services, file-system-certificate config entries must generate Envoy Secret Discovery Service (SDS) secrets:

- Each file-system-certificate in the API gateway snapshot must generate a corresponding Envoy TLS secret
- The generated secret must use the certificate entry's name as the secret name
- The secret must reference the certificate file path for the certificate chain using Envoy's filename data source
- The secret must reference the private key file path using Envoy's filename data source
- Multiple file-system-certificates must generate multiple corresponding secrets
- Nil or missing file-system-certificate entries must be skipped (not generate secrets)

## Notes

- File paths in certificate and private key fields are not validated for existence or accessibility - they are stored as provided
- Unlike inline certificates, file-system certificates do not require validation of certificate content or key matching since the server never sees the actual certificate data
- The implementation must handle file-system-certificates alongside existing inline certificate support

<antml:system>
<total_tokens>1000000 tokens left</total_tokens>
<ctx_window>146364 tokens left</ctx_window>
</antml:system>
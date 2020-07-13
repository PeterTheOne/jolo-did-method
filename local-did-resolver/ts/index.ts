import { DIDDocument, ParsedDID, Resolver } from "did-resolver";

export function getResolver(providerUri: string = PROVIDER_URI, contractAddress: string = CONTRACT_ADDRESS, ipfsHost: string = IPFS_ENDPOINT) {
  return { local: (did: string, parsed: ParsedDID, didResolver: Resolver): Promise<DIDDocument | null> => {
    return Promise.resolve(null)
  }}
}

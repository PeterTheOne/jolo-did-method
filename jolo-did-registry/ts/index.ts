import RegistryContract from "jolocom-registry-contract";
import { IpfsStorageAgent } from "./ipfs";
import { IDidDocument } from "@decentralized-identity/did-common-typescript"

const JOLOCOM_PUBLIC_PROFILE_TYPE = "JolocomPublicProfile"
export const infura =  'https://rinkeby.infura.io/v3/64fa85ca0b28483ea90919a83630d5d8'
export const jolocomContract = '0xd4351c3f383d79ba378ed1875275b1e7b960f120'
export const jolocomIpfsHost = 'https://ipfs.jolocom.com:443'

export function getRegistry(providerUrl: string = infura, contractAddress: string = jolocomContract, ipfsHost: string = jolocomIpfsHost) {
  const registryContract = new RegistryContract(contractAddress, providerUrl)
  const ipfs = new IpfsStorageAgent(ipfsHost)

  const commitDidDoc = async (ethPrivKey: Buffer, didDocument: IDidDocument): Promise<IDidDocument> => {
    const documentHash = await ipfs.storeJSON(didDocument)
    await registryContract.updateDID(
      ethPrivKey,
      didDocument.id, documentHash
    )
    return didDocument
  }

  const publishPublicProfile = async (did: string, publicProfile: object) => generatePublicProfileServiceSection(
    did,
    await ipfs.storeJSON(publicProfile)
  )

  return {
    commitDidDoc,
    publishPublicProfile
  }
}


/**
 * Returns a valid serviceEndpoints entry containing the hash of the newly created
 * public profile
 *
 * @param did - The did of the identity associated with the public profile
 * @param profileIpfsHash - IPFS hash that can be used to dereference the public profile credential
 * @internal
 */

function generatePublicProfileServiceSection(
  did: string,
  profileIpfsHash: string,
) {
  return {
    id: `${ did };jolocomPubProfile`,
    serviceEndpoint: `ipfs://${ profileIpfsHash }`,
    description: 'Verifiable Credential describing entity profile',
    type: JOLOCOM_PUBLIC_PROFILE_TYPE,
  }
}

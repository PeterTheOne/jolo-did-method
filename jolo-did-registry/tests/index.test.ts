import { getRegistry } from "../ts";
import RegistryContract from "jolocom-registry-contract";
import { IpfsStorageAgent } from "../ts/ipfs";
import {
  didDocument,
  didDocumentWithPublicProfile,
  privateKey,
  publicProfile
} from "./test.data";

describe("DID Registry", () => {
  let contractMock, ipfsMock;
  let registry: ReturnType<typeof getRegistry>;

  beforeAll(() => {
    registry = getRegistry();
  });

  beforeEach(() => {
    contractMock = jest
      .spyOn(RegistryContract.prototype, "updateDID")
      .mockResolvedValue();
    ipfsMock = jest
      .spyOn(IpfsStorageAgent.prototype, "storeJSON")
      .mockResolvedValueOnce("firstCall");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should store DID Doc in registry", async () => {
    const didDoc = await registry.commitDidDoc(privateKey, didDocument);
    expect(contractMock.mock.calls[0][2]).toEqual("firstCall");
    expect(didDoc).toEqual({
      "@context": "https://w3id.org/did/v1",
      id: "did:jolo:test",
    });
  });

  it("should add public profile to DID doc", async () => {
    const publicProfileSection = await registry.publishPublicProfile(
      didDocument.id,
      publicProfile
    );

    expect(ipfsMock.mock.calls[0][0]).toEqual(publicProfile);
    expect(ipfsMock).toBeCalledTimes(1);
    expect(publicProfileSection).toEqual({
      description: "Verifiable Credential describing entity profile",
      id: "did:jolo:test;jolocomPubProfile",
      serviceEndpoint: "ipfs://firstCall",
      type: "JolocomPublicProfile"
    });
  });

  // it("should remove public profile if non is passed as second argument", async () => {
  //   const didDoc = await registry.commitDidDoc(
  //     privateKey,
  //     didDocumentWithPublicProfile
  //   );
  //   expect(didDoc).toMatchInlineSnapshot(`
  //     Object {
  //       "@context": "https://w3id.org/did/v1",
  //       "id": "did:jolo:test",
  //       "service": Array [],
  //     }
  //   `);
  // });

  it("should update public profile", async () => {
    const newPubProfile = { data: "hello world" };
    const publicProfileSection = await registry.publishPublicProfile(
      didDocumentWithPublicProfile.id,
      newPubProfile
    );

    expect(ipfsMock.mock.calls[0][0]).toBe(newPubProfile);
    expect(ipfsMock).toBeCalledTimes(1);

    expect(publicProfileSection).toEqual({
      description: "Verifiable Credential describing entity profile",
      id: "did:jolo:test;jolocomPubProfile",
      serviceEndpoint: "ipfs://firstCall",
      type: "JolocomPublicProfile"
    });
  });
});

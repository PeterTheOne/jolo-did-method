import { getPublicProfile, getResolver } from "../ts";
import { Resolver } from "did-resolver";
import { testDid, testDidDoc, testDidDocWithPublicProfile } from "./test.data";

describe("DID Resolver", () => {
  let dbMock;

  beforeEach(() => {
    ethereumMock = jest
      .spyOn(RegistryContract.prototype, "resolveDID")
      .mockResolvedValue("testHash");
    jest
      .spyOn(IpfsStorageAgent.prototype, "catJSON")
      .mockResolvedValue(testDidDoc);
  });

  describe("getResolver", () => {
    it("should resolve jolo DID", async () => {
      const localResolver = getResolver();
      const resolver = new Resolver(localResolver);
      const didDoc = await resolver.resolve(testDid);
      expect(didDoc).toEqual(testDidDoc);
    });

    it("should fail if did id string is wrong", async () => {
      // disable mock in this test
      dbMock.mockRestore();

      const localResolver = getResolver();
      const resolver = new Resolver(localResolver);

      await expect(resolver.resolve("did:un:notHex")).rejects.toThrow();
    });

    it('should return null if DID is not registered', async () => {
      ethereumMock.mockResolvedValue(undefined);

      const resolver = new Resolver(getResolver());

      await expect(resolver.resolve('')).rejects.toThrow('Missing DID');
    });
  });

  describe("getPublicProfile", () => {
    it("should test public profile resolver", async () => {
      const publicProfile = await getPublicProfile(testDidDocWithPublicProfile);
      expect(IpfsStorageAgent.prototype.catJSON).toBeCalledWith("testHash");
      // public profile should be mocked return value of catJson see line #11
      expect(publicProfile).toEqual(testDidDoc);
    });

    it("should return null if no public profile is in DID Document", async () => {
      // @ts-ignore
      const publicProfile = await getPublicProfile(testDidDoc);
      expect(IpfsStorageAgent.prototype.catJSON).toBeCalledTimes(0);
      expect(publicProfile).toBe(undefined);
    });
  });
});

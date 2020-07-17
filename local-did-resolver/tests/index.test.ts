import { getResolver, getRegistrar, extractMessageId } from "../ts";
import { Resolver } from "did-resolver";
import { testDid, testDidDoc } from "./test.data";
import { createDb } from "../ts/db";

describe("Local DID Resolver", () => {
  describe("getResolver", () => {
    it("It should fail to resolve an unknown local DID", async () => {
      const testDb = createDb()
      const resolver = new Resolver(getResolver(testDb));

      return expect(resolver.resolve(testDid)).rejects.toEqual(
        new Error('resolver returned null for did:un:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
      )
    });

    it('It should correctly register a known local DID', async () => {
      const testDb = createDb()
      const keyEvent = await getRegistrar(testDb).create()
      const { icp } = JSON.parse(keyEvent)
      testDb.append([icp])
      return expect(new Resolver(getResolver(testDb)).resolve(extractMessageId(icp))).resolves.toEqual({})
    });
  });
});

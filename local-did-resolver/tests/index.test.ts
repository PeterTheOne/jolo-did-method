import { getResolver, getRegistrar } from "../ts";
import { Resolver } from "did-resolver";
import { createDb } from "../ts/db";

// Testing against a specific implementation (KERI) of a validation function.
import { validateEvents, getIdFromEvent, getIcp } from '@jolocom/native-utils-node'

describe("Local DID Resolver", () => {
  describe("getResolver", () => {
    it("It should fail to resolve an unknown local DID", async () => {
      const testDb = createDb()
      const testDid = 'did:un:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      const resolver = new Resolver(getResolver({
        dbInstance: testDb,
        validateEvents
      }));

      return expect(resolver.resolve(testDid)).rejects.toEqual(
        new Error(`resolver returned null for ${testDid}`)
      )
    });

    it('It should correctly register a known local DID', async () => {
      const db = createDb()

      const registrar = getRegistrar({
        dbInstance: db,
        validateEvents,
        getIdFromEvent,
        create: getIcp,
      })

      const resolver = getResolver({
        dbInstance: db,
        validateEvents
      })

      const keyEvent = await registrar.create()
      
      const { event } = keyEvent

      await registrar.update([event])

      const testDDO = await validateEvents(JSON.stringify([event]))

      const ddo = await new Resolver(resolver)
        .resolve(`did:un:${await getIdFromEvent(event)}`)
      
      return expect(ddo).toEqual(JSON.parse(testDDO))
    });
  });
});

import { getResolver, getRegistrar } from "../ts";
import { Resolver } from "did-resolver";
import { testDid, testDidDoc } from "./test.data";
import { createDb } from "../ts/db";

import { validateEvents, getIdFromEvent, getIcp } from '@jolocom/native-utils-node'

describe("Local DID Resolver", () => {
  describe("getResolver", () => {
    it("It should fail to resolve an unknown local DID", async () => {
      const testDb = createDb()
      const resolver = new Resolver(getResolver({
        dbInstance: testDb,
        validateEvents
      }));


      return expect(resolver.resolve(testDid)).rejects.toEqual(
        new Error('resolver returned null for did:un:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
      )
    });

    it('It should correctly register a known local DID', async () => {
      const testDb = createDb()
      const keyEvent = await getRegistrar({
        dbInstance: testDb,
        validateEvents,
        getIdFromEvent,
        create: getIcp,
      }).create({}) as string
      
      const icp: string = JSON.parse(keyEvent).icp

      const id = await getIdFromEvent(icp)

      testDb.append(`did:un:${id}`, [icp])

      const testDDO = await validateEvents(JSON.stringify([icp]))

      const resolver = new Resolver(getResolver({
        dbInstance: testDb,
        validateEvents
      }))

      const ddo = await resolver.resolve(`did:un:${id}`)
      
      return expect(ddo).toEqual(testDDO)
    });
  });
});

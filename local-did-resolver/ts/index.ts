import { DIDDocument, ParsedDID, Resolver } from "did-resolver";
import { InternalDb } from "./db";
import { validateEvents, getIcp } from '@jolocom/native-utils-node'

export function getResolver(dbInstance: InternalDb) {
  return { 
    un: async (did: string, parsed: ParsedDID, didResolver: Resolver): Promise<DIDDocument | null> => {
      const events = await dbInstance.read(did)

      if (events && events.length) {
        return validateEvents(JSON.stringify(events)) // TODO
        .then(JSON.parse)
      }

      return null
    }
  }
}

export function getRegistrar(dbInstance: InternalDb) {
  return {
    update: async (events: string[]) => {
      try {
        const keyEventId = extractMessageId(events[0])
        const previousEvents = await dbInstance.read(keyEventId) || []

        const document = await validateEvents(
          previousEvents.concat(events)
        )

        const parsedDidDocument = JSON.parse(document)
        dbInstance.append(events)
        return parsedDidDocument
        } catch (err) {
          return err
      }
    },
    delete: (id: string): Promise<boolean> => dbInstance.delete(id),
    create: () => {
      console.warn('For testing')
      return getIcp() // TODO the args are not needed anymore
    }
  }
}

export const extractMessageId = (serializedEvent: string): string => {
  const { keyEvent } = separateEventAndSignature(serializedEvent)
  try {
    return `did:un:${JSON.parse(keyEvent).id}`
  } catch(err) {
    return err
  }
}

const separateEventAndSignature = (serializedEvent: string): {keyEvent: string, signatures: string[]} => {
  const separator = '\r\n\r\n'
  const signatureSeparator = '\n'

  const [keyEvent, signatureBlock] = serializedEvent.split(separator)
  const signatures = signatureBlock.split(signatureSeparator)

  return { keyEvent, signatures }
}

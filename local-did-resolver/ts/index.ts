import { DIDDocument, ParsedDID, Resolver } from "did-resolver";
import { InternalDb } from "./db";

export function getResolver(dbInstance: InternalDb) {
  return { 
    un: async (did: string, parsed: ParsedDID, didResolver: Resolver): Promise<DIDDocument | null> => {
      const events = await dbInstance.read(did)

      if (events && events.length) {
        return KERI.keriValidateEvents(JSON.stringify(events)) // TODO
        .then(JSON.parse)
      }

      return null
    }
  }
}

export function getRegistrar(dbInstance: InternalDb) {
  return {
    update: async (message: string) => {
      try {
        const keyEventId = extractMessageId(message)
        const previousEvents = await dbInstance.read(keyEventId) || []

        const document = await KERI.keriValidateEvents(
          `[${previousEvents.concat(message).join(',')}]` // TODO
        )

        const parsedDidDocument = JSON.parse(document)
        dbInstance.append(message)
        return parsedDidDocument
        } catch (err) {
          return err
      }
    },
    delete: (id: string): Promise<boolean> => dbInstance.delete(id),
    create: () => {
      console.warn('For testing')
      return KERI.keriGetIcp() // TODO the args are not needed anymore
    }
  }
}

export const extractMessageId = (serializedEvent: string): string => {
  const { keyEvent } = separateEventAndSignature(serializedEvent)
  try {
    return JSON.parse(keyEvent).id
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

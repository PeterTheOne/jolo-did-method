import { DIDDocument, ParsedDID, Resolver } from "did-resolver";
import { InternalDb } from "./db";

type EventValidationFunction = (events: string) => Promise<string>
type IdExtractionFunction = (event: string) => Promise<string>
type IdCreationFunction = <T, C>(config?: C) => Promise<T>

export const getResolver = (cfg: {
  dbInstance: InternalDb,
  validateEvents: EventValidationFunction,
}) => ({ 
    un: async (did: string, parsed: ParsedDID, didResolver: Resolver): Promise<DIDDocument | null> => {
      const events = await cfg.dbInstance.read(parsed.id)

      if (events && events.length) {
        return JSON.parse(await cfg.validateEvents(JSON.stringify(events)))
      }

      return null
    }
 })

export const getRegistrar = (cfg: {
  dbInstance: InternalDb,
  validateEvents: EventValidationFunction,
  getIdFromEvent: IdExtractionFunction,
  create: IdCreationFunction
}) => ({
    update: async (events: string[]) => {
      try {
        const keyEventId = await cfg.getIdFromEvent(events[0])
        const previousEvents = await cfg.dbInstance.read(keyEventId) || []

        const document = await cfg.validateEvents(
          JSON.stringify(previousEvents.concat(events))
        )

        await cfg.dbInstance.append(keyEventId, events)
        return document
        } catch (err) {
          return err
      }
    },
    delete: (id: string): Promise<boolean> => cfg.dbInstance.delete(id),
    create: cfg.create
  })
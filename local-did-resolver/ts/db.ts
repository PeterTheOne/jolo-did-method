import { extractMessageId } from "."

interface DbState {
  [did: string]: string[]
}

// SMALL MOCK IMPLEMENTATION, this will mutate the initialState
export const createDb = (initialState: DbState = {}): InternalDb =>
  ({
    append: async (events: string[]) => {
      const eventId = extractMessageId(events[0])
      if (!initialState[eventId] || !initialState[eventId].length) {
        initialState[eventId] = []
      }

      initialState[eventId] = initialState[eventId].concat(events)
      return true
    },
    delete: async (id: string) => {
      initialState[id] = [] 
      return true
    },
    read: async id => initialState[id] || [],
    debug: () => initialState
  })

export interface InternalDb {
  read: (id: string) => Promise<string[]>
  append: (events: string[]) => Promise<boolean>
  delete: (id: string) => Promise<boolean>,
  debug: () => DbState
}

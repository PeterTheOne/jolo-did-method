import { extractMessageId } from "."

interface DbState {
  [did: string]: string[]
}

// SMALL MOCK IMPLEMENTATION, this will mutate the initialState
export const createDb = (initialState: DbState = {}): InternalDb =>
  ({
    append: async (event: string) => {
      const eventId = extractMessageId(event)
      if (!initialState[eventId].length) {
        initialState[eventId] = []
      }

      initialState[eventId].push(event)
      return true
    },
    delete: async (id: string) => {
      initialState[id] = [] 
      return true
    },
    read: async id => initialState[id]
  })

export interface InternalDb {
  read: (id: string) => Promise<string[]>
  append: (event: string) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

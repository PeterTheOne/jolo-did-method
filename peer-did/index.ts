
import * as crypto from 'crypto'
import * as bs58 from 'bs58'


type GenerationInput = {
    id: string,
    type: string,
    controller: '#id',
    publicKeyBase58: string
}

export const genesisDDO = (
    input: GenerationInput
) => ({
    "@context": "https://www.w3.org/ns/did/v1",
    id: "",
    publicKey: [input],
    authorization: {
        profiles: [],
        rules: [
            {
                // this DSL is called SGL: https://evernym.github.io/sgl/
                grant: ['register'],
                when: { id: input.id },
                id: input.id
            }
        ]
    }
})

const getNumericBasis = genesisDDO =>
    crypto.createHash('sha256')
        .update(genesisDDO.toString())
        .digest()

const getEncNumBasis = (
    numericBasis: Buffer
) => Buffer.concat([
    // the first 2 bytes encode the method and length of the hashing algorithm
    Buffer.from('1220', 'hex'),
    numericBasis
])

export const getDID = genesisDDO =>
    // the 1z encodes the generation algo used and the base58 encoding
    `did:peer:1z${bs58.encode(getEncNumBasis(getNumericBasis(genesisDDO)))}`

console.log(getDID(genesisDDO({
    id: 'henlo',
    type: 'some type',
    controller: '#id',
    publicKeyBase58: 'keylmao'
})))

type Delta = {
    change: string,
    by: {
        key: string,
        sig: string
    }[],
    when: string
}

type DidDoc = {
    id: string,
    publicKey: GenerationInput[],
    authorization: {
        profiles: [],
        rules: [
            {
                // this DSL is called SGL: https://evernym.github.io/sgl/
                grant: string[],
                when: {id: string },
                id: string
            }
        ]
    }
}

interface IResolver {
    update: (did: string, ddo: DidDoc) => boolean,
    resolve: (did: string) => string
}

interface Transport<M> {
    send: (message: M) => Promise<boolean>
}

class Resolver implements IResolver {
    private perspective: Map<string, DidDoc>

    constructor() {
        this.perspective = new Map()
    }

    public update(did: string, ddo: DidDoc) {
        this.perspective.set(did, ddo)
    }

    public resolve(did: string) {
        return this.perspective.get(did)
    }
}

const DidExchangeInviter = <M extends DidDoc>(
    resolver: IResolver,
    transport: Transport<M>,
    validate: (m: M) => boolean
) => function*(
) {
    // null state

    // send invitation
    const invitation: M = yield
    transport.send(invitation)

    // invited state

    // recieve exchange_request
    const response: M = yield

        // requested state

    if (validate(response)) {
        resolver.update(response.id, response)
        resolver.resolve(response.id) //??
        // done when??
    }

}

const DidExchangeInvitee = <M extends DidDoc>(
    resolver: IResolver,
    transport: Transport<M>
) => function*(

) {
    // null state
    // recieve invitation
    const invitation: M = yield

    // invited state
    // send exchange_request
    const request: M = yield

    transport.send(request)

    // requested state
    // recieve exchange_response
    const response: M = yield

    // responded state
    // do yo thing
}

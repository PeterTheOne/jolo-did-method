
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

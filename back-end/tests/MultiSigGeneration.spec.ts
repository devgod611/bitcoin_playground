import 'ts-jest';
declare var require: any;
let MultiSigGeneration = require('../src/MultiSigGeneration').default;
describe('MultiSig P2SH Generation Test', () => {
    const multiSigGeneration = new MultiSigGeneration()

    test('test-multisig-gen-0', async () => {
        const mValue: number = 2
        const nValue: number = 3
        const pubkeys = [
            '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
            '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
            '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
        ]

        let generatedAddress = multiSigGeneration.generateP2SHMultiSig(mValue,nValue,pubkeys);
        expect(generatedAddress).toMatch("36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7")
    })

    test('test-multisig-gen-1',async () => {
        const mValue: number = 3
        const nValue: number = 4
        const pubkeys = [
            '02e135e12b4417b41e92e738448cb51581c70f14bf885b0d4056ac2c3cc5c8729c',
            '022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b32c',
            '02799dc04a8acf04e793ff0f2c35c20c0388529eb964c565a455f13c07123c9ea2',
            '022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b33e',
        ]

        let generatedAddress = multiSigGeneration.generateP2SHMultiSig(mValue,nValue,pubkeys);
        expect(generatedAddress).toMatch("3HTvC9AFZJughwxZUJYPMbAqz57a1YpCf2")
    })


    test('test-multisig-gen-2 Invalid Count of public keys inserted',async () => {
        const mValue: number = 3
        const nValue: number = 4
        const pubkeys=[ 
            '02e135e12b4417b41e92e738448cb51581c70f14bf885b0d4056ac2c3cc5c8729c',
            '022015b568fb0f2f792e2e1d230a7f64e8a75b5d4a3ae549b55c3724cdc148b32c',]
        let generatedAddress = multiSigGeneration.generateP2SHMultiSig(mValue,nValue,pubkeys);
        expect(generatedAddress).toBeNull();
    })


})

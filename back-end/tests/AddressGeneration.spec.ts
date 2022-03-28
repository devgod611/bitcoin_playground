import 'ts-jest'
declare var require: any;
let AddressGeneration=require('../src/AddressGeneration').default;
describe('Segwit AddressGeneration Functional Tests', () => {
    const generation = new AddressGeneration()
    test('test-gen-0', async () => {

        let seedPhrase = "lizard century nut catch figure build swift call pledge toe cereal truck recipe faint clerk"
        let derivationPath = "m/84'/0'/0'/0/0"

        let generatedAddress = generation.derive(seedPhrase, derivationPath);

        expect(generatedAddress).toMatch("bc1q0j5dewvk89ss00l68a9hf8lah4c66wmahddmdv")
    })

    test('test-gen-1', async () => {

        let seedPhrase = "dove lumber quote board young robust kit invite plastic regular skull history myself grass old"
        let derivationPath = "m/84'/0'/0'/0/0"

        let generatedAddress = generation.derive(seedPhrase, derivationPath);

        expect(generatedAddress).toMatch("bc1qrd8rth4r228a4qhthk9lf0yve9c90uh4uret3x")
    })
    test('test-gen-2 Invalid Input Parameters: Seed Phrase', async () => {

        let seedPhrase = "dove lumber"
        let derivationPath = "m/84'/0'/0'/0/0"

        let generatedAddress = generation.derive(seedPhrase, derivationPath);

        expect(generatedAddress).toBeNull();
    })

    test('test-gen-3 Invalid Input Parameters: Derivation path', async () => {

        let seedPhrase = "dove lumber"
        let derivationPath = "m"

        let generatedAddress = generation.derive(seedPhrase, derivationPath);

        expect(generatedAddress).toBeNull();
    })

})

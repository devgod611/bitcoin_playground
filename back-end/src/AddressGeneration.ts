import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';




/**
 *
 * @description Native Segwit bech-32 address
  *Prefix “1”: Legacy Addresses, aka, Pay to Public Key Hash (P2PKH)
  *Prefix “bc1”: Native SegWit Bech32 Addresses, aka, Pay to Witness Public Key Hash (P2WPKH)
  *Prefix “3”: Nested SegWit Addresses, aka, Pay to Witness Public Key Hash in a Pay to Script Hash (P2SH-P2WPKH)
 * @export
 * @class AddressGeneration
 */
export default class AddressGeneration{
    generatedAddress: string = ""
    seedPhrase: string = ""
    derivationPath: string = ""
    words: string[]=[]
    public derive(seedPhrase: string, derivationPath: string): string | null
    {
      if(this.validateInputs(seedPhrase))
      {
      var seed = bip39.mnemonicToSeedSync(seedPhrase, "");
      const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
      const account = root.derivePath(derivationPath);
      let publicKey = account.publicKey;
      return bitcoin.payments.p2wpkh({pubkey: publicKey}).address ?? "";
      }
      console.log("Seed length must be greater than 12 words")
      return null;
    }
    validateInputs(seedPhrase:string): boolean {
      var words = seedPhrase.trim().split(" ");
  // Mnemonic phrases can be from 3 words to 24 words but the most used interval is 12-24
      if (words.length >= 12 && words.length <= 24) {
        return true
      }
      else
      {
        return false;
      }
    }  
  }
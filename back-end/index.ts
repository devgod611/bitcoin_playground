declare function require(path: string): any;
const express = require('express');
const cors=require('cors');
import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { Router, Request, Response} from 'express';
const app = express();
app.use(cors());
//import swaggerUi = require('swagger-ui-express');
import swaggerUi from 'swagger-ui-express';
//import * as swaggerDocument from './openapi.json';
import * as bodyParser from 'body-parser';
/**
 *
 *
 * @export
 * @class MultiSigCreation 
 * @description n-out-of-m multi-sig P2SH address generator
 * @param mvalue: (number) Value of M (Number to be used)
 * @param nValue: (number) Value of N
 * @param publicKeys: (List[]) List[] of all the public keys
 */
export class MultiSigCreation {
  mValue: number = 2
  nValue: number = 3
  publicKeys: Array<string> = new Array<string>(this.nValue);
  /**
   *
   *
   * @param {number} mvalue
   * @param {number} nValue
   * @param {Array<string>} _publicKeys
   * @return {*}  {(string | null)}
   * @memberof MultiSigCreation
   */
  public generateP2SHMultiSig(m:number,n:number,_publicKeys: Array<string>): string | null {
    try {
      this.mValue=m;
      this.nValue=n;
      this.publicKeys=new Array<string>(n);  
      let pubkeys: Buffer[] = _publicKeys
        .filter(pk => pk.length > 0)
        .map(hex => Buffer.from(hex, 'hex'));

      if (pubkeys.length == 0) {
        console.log("Input public keys for calculating multi-sig")
        return null
      }

      const { address } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({ m: this.mValue, pubkeys }),
      })
      return address ?? ""

    } catch (e) {
     console.log("Failed To generate multi-sig address");
      return null
    }
  }
  getMultiSig() {
    let address = this.generateP2SHMultiSig(this.mValue,this.nValue,this.publicKeys);
    console.log(`Generated address: ${address}`)
  }
}

/**
 *
 * @description Native Segwit bech-32 address
  *Prefix “1”: Legacy Addresses, aka, Pay to Public Key Hash (P2PKH)
  *Prefix “bc1”: Native SegWit Bech32 Addresses, aka, Pay to Witness Public Key Hash (P2WPKH)
  *Prefix “3”: Nested SegWit Addresses, aka, Pay to Witness Public Key Hash in a Pay to Script Hash (P2SH-P2WPKH)
 * @export
 * @class AddressGeneration
 */
export class AddressGeneration{
  generatedAddress: string = ""
  seedPhrase: string = ""
  derivationPath: string = ""
  words: string[]=[]
  public derive(seedPhrase: string, derivationPath: string): string {
    var seed = bip39.mnemonicToSeedSync(seedPhrase, "");
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    const account = root.derivePath(derivationPath);
    let publicKey = account.publicKey;
    return bitcoin.payments.p2wpkh({pubkey: publicKey}).address ?? "";
  }
  public validateInputs(seedPhrase:string): boolean {
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

app.get('/',(req: Request, res: Response) =>{
  res.status(200).send("");
})
app.get('/segwit_address_generator/:seedPhrase/:path', (req: Request, res: Response) => {
  const generate=new AddressGeneration()
  var seedPhrase = req.params.seedPhrase;
  var derivationPath = req.params.path;
  if(!generate.validateInputs(seedPhrase))
  {
    //console.log("incorrect input");
    res.status(412).send("Please check the input parameters, seed phrase words length must be between 12-24");
  }
  else
  {
      try {
        let generatedAddress=generate.derive(seedPhrase,derivationPath);
        res.status(200).send(generatedAddress);
    } catch (e)
    {
      res.status(400).send("There was an issue generating address");
    }
  }
});

app.get('/multisig/:m/:n/:publicKeys', (req: Request, res: Response) => {
  const multiSigGeneration = new MultiSigCreation();
  const mvalue=parseInt(req.params.m);
  const nvalue=parseInt(req.params.n);
  let publicKeys: Array<string> = new Array<string>(nvalue);
  publicKeys= req.params.publicKeys.split(',');
  if(publicKeys.length!=nvalue)
  {
    res.status(412).send("Check the input parameters, there must be " + nvalue + " public keys");
  }
  if (nvalue<=mvalue)
  {
    res.status(412).send("Check the input parameters n must be greater than m for multi-sig address generation");
  }
  try{
  let generatedAddress = multiSigGeneration.generateP2SHMultiSig(mvalue,nvalue,publicKeys);
  if(generatedAddress==null)
  {
    res.status(412).send("Incorrect Public Keys, failed to generate address");
  }
  res.status(200).send(generatedAddress);
  }
  catch(e)
  {
    res.status(400).send("Failed to generate multi-sig address");
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on PORT ${port}`));
module.exports={app,AddressGeneration,MultiSigCreation};
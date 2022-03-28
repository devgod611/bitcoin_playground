import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';



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
export default class MultiSigCreation {
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
  
        if (pubkeys.length == 0 || pubkeys.length!=this.nValue) {
          console.log("Input "+this.nValue+" public keys for calculating multi-sig")
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
  
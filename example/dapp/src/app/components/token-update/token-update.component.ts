import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { CustomFee, CustomFixedFee, CustomFractionalFee, CustomRoyaltyFee, Hbar, HbarUnit, PublicKey, TokenSupplyType, TokenType, TokenUpdateTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-token-update',
    templateUrl: './token-update.component.html',
    styleUrls: ['./token-update.component.scss']
})
export class TokenUpdateComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    signingAcct: string;


    tokenData = {
        name: "TokenTest" + Math.random(),
        symbol: "",
        tokenId: ""
    }


    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }

                if (_Button.ID === 'send') {
                    this.send();
                }
            })
        );
    }

    async send() {
        let accountInfo: any = await window.fetch("https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct, { method: "GET" });
        accountInfo = await accountInfo.json();
        let customFees: CustomFee[] = [];

        let key = await PublicKey.fromString(accountInfo.key.key)

        let trans = await new TokenUpdateTransaction()
        if (this.tokenData.name)
            trans.setTokenId(this.tokenData.tokenId)
        if (this.tokenData.name)
            trans.setTokenName(this.tokenData.name)
        if (this.tokenData.symbol)
            trans.setTokenSymbol(this.tokenData.symbol)
        if (this.signingAcct)
            trans.setTreasuryAccountId(this.signingAcct)
        if (key)
            trans.setAdminKey(key)
        if (key)
            trans.setSupplyKey(key)
        if (key)
            trans.setWipeKey(key)
        if (this.signingAcct)
            trans.setAutoRenewAccountId(this.signingAcct)

        let transBytes: Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        let res = await this.HashconnectService.sendTransaction(transBytes, this.signingAcct);

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        if (res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

        this.HashconnectService.showResultOverlay(responseData);
    }

}

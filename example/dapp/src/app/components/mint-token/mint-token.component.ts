import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { TokenMintTransaction } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-mint-token',
    templateUrl: './mint-token.component.html',
    styleUrls: ['./mint-token.component.scss']
})
export class MintTokenComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    signingAcct: string;

    data = {
        tokenId: "",
        amount: 0,
        isNft: false,
        metadata: ""
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
        let trans = await new TokenMintTransaction();

        let transBytes:Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        this.HashconnectService.sendTransaction(transBytes, this.signingAcct);
    }

}

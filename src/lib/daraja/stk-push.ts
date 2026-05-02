// STK Push (a.k.a. "Lipa Na M-Pesa Online"): triggers a payment prompt on
// the customer's phone. Used for viewing fees, deposits, rent.
//
// Daraja's response only tells us the prompt was sent — the actual outcome
// arrives async at our callback URL. We persist a 'pending' Payment row
// before triggering the prompt so the callback handler can match by
// CheckoutRequestID.

import "server-only";
import { darajaFetch, stkPushAuth } from "./client";
import { env } from "@/lib/env";
import { normalizeKenyanMobile } from "@/lib/format";

export type StkPushArgs = {
    msisdn: string;        // raw user input is fine; we normalize
    amountKes: number;     // whole shillings; Daraja rejects fractions
    accountReference: string;  // shows in customer's M-Pesa SMS
    transactionDesc: string;   // free text, max 13 chars in practice
};

export type StkPushResult = {
    checkoutRequestId: string;
    merchantRequestId: string;
    customerMessage: string;
};

export async function stkPush(args: StkPushArgs): Promise<StkPushResult> {
    const phone = normalizeKenyanMobile(args.msisdn);
    if (!phone) throw new Error("Invalid Kenyan mobile");

    // Daraja wants 2547XXXXXXXX with no plus.
    const partyA = phone.replace("+", "");

    if (args.amountKes < 1 || !Number.isInteger(args.amountKes)) {
        throw new Error("Amount must be a positive whole-shilling integer");
    }

    const { timestamp, password } = stkPushAuth();

    const res = await darajaFetch<{
        MerchantRequestID: string;
        CheckoutRequestID: string;
        ResponseCode: string;
        ResponseDescription: string;
        CustomerMessage: string;
    }>("/mpesa/stkpush/v1/processrequest", {
        body: {
            BusinessShortCode: env.daraja.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: args.amountKes,
            PartyA: partyA,
            PartyB: env.daraja.shortcode,
            PhoneNumber: partyA,
            CallBackURL: env.daraja.callbackUrl,
            AccountReference: args.accountReference.slice(0, 12),
            TransactionDesc: args.transactionDesc.slice(0, 13),
        },
    });

    if (res.ResponseCode !== "0") {
        throw new Error(`STK push rejected: ${res.ResponseDescription}`);
    }

    return {
        checkoutRequestId: res.CheckoutRequestID,
        merchantRequestId: res.MerchantRequestID,
        customerMessage: res.CustomerMessage,
    };
}

// Shape of the Daraja STK callback. Stkcallback lives at:
//   body.Body.stkCallback
export type StkCallback = {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;        // 0 = success, anything else = failure
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{ Name: string; Value?: string | number }>;
            };
        };
    };
};

export function parseStkCallback(payload: StkCallback) {
    const cb = payload.Body.stkCallback;
    const items = cb.CallbackMetadata?.Item ?? [];
    const get = (name: string) => items.find((i) => i.Name === name)?.Value;

    return {
        checkoutRequestId: cb.CheckoutRequestID,
        merchantRequestId: cb.MerchantRequestID,
        success: cb.ResultCode === 0,
        resultDesc: cb.ResultDesc,
        amount:        Number(get("Amount") ?? 0),
        mpesaReceipt:  String(get("MpesaReceiptNumber") ?? ""),
        phoneNumber:   String(get("PhoneNumber") ?? ""),
        transactionDate: String(get("TransactionDate") ?? ""),
    };
}

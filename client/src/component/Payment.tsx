import { React, useState, useEffect } from 'react';
import { callApi } from '../config/api.ts';

interface PymtData {
    orderId: string;
    txnToken: string;
    success: boolean;
    message: string;
}

const MakePayemnt: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);// add type with proper data
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const scriptId = "paytm_karo";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://secure.paytm.in/merchantpgpui/clientjs/merchantpg.js";
            script.crossOrigin = ""; // need to know about this script attribute properly
            document.body.appendChild(script);
        }
    }, [])

    const initiatePayemnt = async () => {
        try {
            const res = await callApi("/payment/initiate", "POST", {});
            console.log(res.data);
            if (res.data.success) {
                setData(res.data);
                setError(null);
                const config = {
                    root: "", // this means exactly where shall the paytm payment pop up rise, if I put "#id_of_element", it will be visible inside that. the "" denotes that it will freeze the background , a pop up will rise.
                    flow: "DEFAULT",
                    data: {
                        orderId: data.orderId,
                        token: data.txnToken,
                        tokenType: "TXN_TOKEN",
                        amount: "1000.00" // amount need to be derieved from api call
                    },
                    handler: {
                        notifyMerchant: function (eventName, data) {
                            console.log("Paytm UI Event:", eventName, data);
                        }
                    }
                };

                // 4. Open the UI overlay
                if (window.Paytm && window.Paytm.CheckoutJS) { // the Paytm key will be created by the script tag link.
                    await window.Paytm.CheckoutJS.init(config);
                    window.Paytm.CheckoutJS.invoke();
                }
                else {
                    console.log("Error ", res.data.message);
                    setError(res.data.message);
                }
            }
        }
        catch (error) {
            console.log("error after calling initiatepaymetn api call", error)
            setError(error.message); // seterror
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button onClick={initiatePayemnt} disabled={submitting}>{submitting ? "Creating Payment" : "initiatePayemnt"}</button>
        </>
    )
}
export default MakePayemnt;
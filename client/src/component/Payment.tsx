import { React, useState, useEffect, use } from 'react';
import { callApi } from '../config/api';

const MakePayemnt : React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);// add to type with proper data
    const [submitting, setSubmitting] = useState<boolean>(false);

    const initiatePayemnt = async () => {
        setSubmitting(true);
        try {
            const res = await callApi();
        } catch (err: any) {
            setError(err.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
        <button onClick={initiatePayemnt} disabled={submitting}>
            {submitting ? 'Initiating...' : 'Initiate Payment'}
        </button>
        </>
    )
}

export default MakePayemnt
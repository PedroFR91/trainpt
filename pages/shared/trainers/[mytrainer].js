import { useRouter } from 'next/router';
import React from 'react'

const mytrainer = () => {
    const router = useRouter();
    const { mytrainer } = router.query;

    return (
        <div style={{ color: '#000' }}>{mytrainer}</div>
    )
}

export default mytrainer
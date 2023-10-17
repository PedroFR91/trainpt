import { useRouter } from 'next/router';
import React from 'react'
import Photos from '../../../components/client/photos';
import Measures from '../../../components/client/measures';
import Form from '../../../components/client/forms'
import Train from '../../../components/client/train'
import Docs from '../../../components/client/docs'
const clientsId = () => {

    const router = useRouter();
    const { clientId } = router.query;

    return (
        <div>
            {clientId ?
                <>

                    <Photos clientId={clientId} />
                    <Measures clientId={clientId} />
                    <Train clientId={clientId} />
                    {/* <Form clientId={clientId} /> */}
                    <Docs clientId={clientId} />

                </> : <h1>Cargando</h1>}
        </div>
    )
}

export default clientsId;
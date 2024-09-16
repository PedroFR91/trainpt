import { useRouter } from 'next/router';
import React from 'react';
import { Spin, Layout, Typography } from 'antd';
import Photos from '../../../components/client/photos';
import Measures from '../../../components/client/measures';
import Train from '../../../components/client/train';
import Docs from '../../../components/client/docs';

const { Content, Header } = Layout;
const { Title } = Typography;

const ClientPage = () => {
    const router = useRouter();
    const { clientId } = router.query;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header >
                <Title style={{ color: '#fff', margin: 0 }} level={3}>
                    Cliente: {clientId ? clientId : 'Cargando...'}
                </Title>
            </Header>
            <Content style={{ padding: '24px' }}>
                {clientId ? (
                    <>
                        <Photos clientId={clientId} />
                        <Measures clientId={clientId} />
                        <Train clientId={clientId} />
                        <Docs clientId={clientId} />
                    </>
                ) : (
                    <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} />
                )}
            </Content>
        </Layout>
    );
}

export default ClientPage;

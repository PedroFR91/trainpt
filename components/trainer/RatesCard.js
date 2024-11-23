import React from 'react';
import { Card, Carousel } from 'antd';
import { ShareAltOutlined, CopyOutlined } from '@ant-design/icons';
import styles from '../../styles/myrates.module.css';

const { Meta } = Card;

const RatesCard = ({ rates, onShare, publicView = false }) => {
    return (
        <Card title="Tarifas" hoverable>
            {rates.length === 0 ? (
                <p>No hay tarifas disponibles.</p>
            ) : (
                <Carousel dots={false} arrows slidesToShow={1} slidesToScroll={1} infinite={false}>
                    {rates.map((rate) => (
                        <Card
                            key={rate.id}
                            className={styles.rateCard}
                            bodyStyle={{
                                backgroundColor: rate.backgroundColor || '#ffffff',
                            }}
                            style={{
                                borderRadius: '10px',
                                margin: '0 10px',
                            }}
                            actions={
                                !publicView
                                    ? [
                                        <ShareAltOutlined key="share" onClick={() => onShare(rate)} />,
                                        <CopyOutlined key="copy" onClick={() => onShare(rate)} />,
                                    ]
                                    : null
                            }
                        >
                            <Meta
                                title={<h2 style={{ textAlign: 'center' }}>{rate.ratename}</h2>}
                                description={
                                    <>
                                        <div className={styles.priceContainer}>
                                            <h3>{rate.rateprice} €</h3>
                                            <span>/{rate.ratefrequency}</span>
                                        </div>
                                        <div className={styles.rateInfo}>{rate.rateinfo}</div>
                                    </>
                                }
                            />
                        </Card>
                    ))}
                </Carousel>
            )}
        </Card>
    );
};

export default RatesCard;

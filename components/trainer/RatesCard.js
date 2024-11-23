import React from 'react';
import { Card, Carousel } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from '../../styles/myrates.module.css';

const { Meta } = Card;

const RatesCard = ({ rates, onEdit }) => {
    return (
        <Card title="Mis Tarifas" hoverable>
            {rates.length === 0 ? (
                <p>No hay tarifas disponibles.</p>
            ) : (
                <Carousel
                    dots
                    arrows
                    slidesToShow={1}
                    slidesToScroll={1}
                    infinite={false}
                >
                    {rates.map((rate) => (
                        <Card
                            key={rate.id}
                            className={styles.rateCard}
                            bodyStyle={{
                                backgroundColor: rate.backgroundColor || '#ffffff',
                                padding: '20px',
                            }}
                            style={{
                                borderRadius: '10px',
                                margin: '10px 0',
                                minHeight: '250px',
                            }}
                            actions={[
                                <EditOutlined key="edit" onClick={() => onEdit(rate)} />,
                            ]}
                        >
                            <Meta
                                title={<h2 style={{ textAlign: 'center' }}>{rate.ratename}</h2>}
                                description={
                                    <div>
                                        <div className={styles.priceContainer}>
                                            <h3>{rate.rateprice} €</h3>
                                            <span>/{rate.ratefrequency}</span>
                                        </div>
                                        <div
                                            className={styles.rateInfo}
                                            dangerouslySetInnerHTML={{
                                                __html: rate.rateinfo || "Sin información adicional",
                                            }}
                                        ></div>
                                    </div>
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

import React from "react";
import styles from "../../styles/myprofile.module.css";

const MyRatesClient = ({ rates }) => {
    return (
        <div className={styles.rates}>
            {rates.map((rate) => (
                <div key={rate.id} className={styles.rate}>
                    <h1>{rate.ratename}</h1>
                    <h2>{rate.rateprice}</h2>
                    <div
                        className={styles.displayTextTwo}
                        dangerouslySetInnerHTML={{ __html: rate.rateinfo }}
                    ></div>
                </div>
            ))}
        </div>
    );
};

export default MyRatesClient;

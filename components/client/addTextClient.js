import React from "react";
import styles from "../../styles/myprofile.module.css";

const AddTextClient = ({ initialText }) => {
    return (
        <div className={styles.addText}>
            {initialText === " " ? (
                "Introduzca su información"
            ) : (
                <div
                    className={styles.displayText}
                    dangerouslySetInnerHTML={{ __html: initialText }}
                ></div>
            )}
        </div>
    );
};

export default AddTextClient;

import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase.config";

const myexercises = () => {
    const [exercises, setExercises] = useState([]);
    useEffect(() => {
        const unsubExercises = onSnapshot(
            collection(db, "exercises"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setExercises(list);
            },
            (error) => {
                console.log(error);
            }
        );
        return () => {
            unsubExercises();
        };
    }, []);
    return (
        <>
            {exercises.map((exercise, index) => (
                <div key={index} style={{ width: '200px', border: '1px solid #ffffff', padding: '1rem', borderRadius: '8px' }}>
                    <p>Ejercicio: {exercise.name}</p>
                    <p>Materiales: {exercise.material}</p>
                    <p>Comentarios:{exercise.comments}</p>
                </div>
            ))}
        </>
    );
};

export default myexercises;

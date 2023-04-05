import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

export const getRoutineData = async (routineId) => {
  try {
    const routineRef = doc(db, 'routines', routineId);
    const routineSnap = await getDoc(routineRef);

    if (routineSnap.exists()) {
      return routineSnap.data();
    } else {
      console.error('No se encontró la rutina con el ID especificado.');
    }
  } catch (error) {
    console.error('Error al obtener datos de la rutina:', error);
  }
};

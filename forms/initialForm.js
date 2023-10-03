export const initialForm = {
  name: '',
  gender: '',
  weight: '',
  height: '',
  measures: {
    chest: '',
    shoulders: '',
    biceps: '',
    hips: '',
    abdomen: '',
    cuadriceps: '',
    gemelos: '',
  },
  lateral: '',
  front: '',
  back: '',
  intolerances: '',
  preferredFoods: '',
  trainingDays: {
    type: 'select',
    label: 'Días de entrenamiento:',
    options: Array.from({ length: 7 }, (_, index) => ({
      value: (index + 1).toString(),
      label: index + 1,
    })),
    value: '', // Valor inicial del select
  },
};
export const follow = {
  measures: {
    chest: '',
    shoulders: '',
    biceps: '',
    hips: '',
    abdomen: '',
    cuadriceps: '',
    gemelos: '',
  },
  lateral: '',
  front: '',
  back: '',
};

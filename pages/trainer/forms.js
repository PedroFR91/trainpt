import React, { useState } from 'react';
import styles from '../../styles/forms.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
const forms = () => {
  const [showInitial, setShowInitial] = useState(false);
  const [showFollow, setShowFollow] = useState(false);

  const handleSend = () => {
    setShowInitial(false);
    setShowFollow(false);
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />
      {!showInitial && !showFollow && (
        <div className={styles.formContainer}>
          <h1>Formularios base</h1>
          <div>
            <p>Formulario Inicial</p>
            <p onClick={() => setShowInitial(true)}>Editar</p>
            <p>Compartir</p>
          </div>
          <div>
            <p>Formulario Seguimiento</p>
            <p onClick={() => setShowFollow(true)}>Editar</p>
            <p>Compartir</p>
          </div>
          <h1>Formularios Contestados</h1>
        </div>
      )}
      {showInitial && (
        <div className={styles.inicial}>
          <div>
            <p>Nombre</p>
            <input type='text' />
          </div>
          <div>
            <p>Sexo</p>
            <fieldset>
              <div>
                <label>Hombre</label>
                <input type='radio' name='genre' id='' />
              </div>

              <div>
                <label>Mujer</label>
                <input type='radio' name='genre' id='' />
              </div>
            </fieldset>
          </div>
          <div>
            <p>Peso</p>
            <input type='text' />
          </div>
          <div>
            <p>Altura</p>
            <input type='text' />
          </div>
          <div>
            <p>Medidas</p>
            <input type='text' placeholder='Pecho (cm)' />
            <input type='text' placeholder='Hombros (cm)' />
            <input type='text' placeholder='Bíceps (cm)' />
            <input type='text' placeholder='Cintura (cm)' />
            <input type='text' placeholder='Abdomen (cm)' />
            <input type='text' placeholder='Cuádriceps (cm)' />
            <input type='text' placeholder='Gemelo (cm)' />
          </div>
          <div>
            <p>Fotos</p>
            <div>
              <p>Frente</p>
              <input type='file' name='' id='' />
            </div>
            <div>
              <p>Espalda</p>
              <input type='file' name='' id='' />
            </div>
            <div>
              <p>Perfil</p>
              <input type='file' name='' id='' />
            </div>
          </div>
          <div>
            <p>Intolerancias</p>
            <input type='text' name='' id='' />
          </div>
          <div>
            <p>Alimentos Preferidos</p>
            <input type='text' name='' id='' />
          </div>
          <div>
            <p>Días de entrenamiento</p>
          </div>
          <button onClick={() => setShowInitial(false)}>Atrás</button>
          <button onClick={handleSend}>Enviar</button>
        </div>
      )}
      {showFollow && (
        <div className={styles.follow}>
          <div>
            <p>Medidas</p>
            <input type='text' placeholder='Pecho' />
            <input type='text' placeholder='Hombros' />
            <input type='text' placeholder='Bíceps' />
            <input type='text' placeholder='Cintura' />
            <input type='text' placeholder='Abdomen' />
            <input type='text' placeholder='Cuádriceps' />
            <input type='text' placeholder='Gemelo' />
          </div>
          <div>
            <p>Peso</p>
            <input type='text' />
          </div>
          <div>
            <p>Fotos</p>
            <input type='file' name='' id='' />
            <input type='file' name='' id='' />
            <input type='file' name='' id='' />
          </div>

          <div>
            <p>Seguimiento Dieta</p>
            <form>
              <fieldset>
                <div>
                  <label>Perfecto</label>
                  <input type='radio' name='dieta' id='p' />
                </div>
                <div>
                  <label>Bueno, con faloos</label>
                  <input type='radio' name='dieta' id='b' />
                </div>
                <div>
                  <label>Regular</label>
                  <input type='radio' name='dieta' id='r' />
                </div>
                <div>
                  <label>No la he seguido</label>
                  <input type='radio' name='dieta' id='n' />
                </div>
              </fieldset>
            </form>
          </div>
          <div>
            <p>Alimentos Preferidos</p>
            <input type='text' name='' id='' />
          </div>
          <div>
            <form>
              <fieldset>
                <legend>Días de entrenamiento</legend>
                <div>
                  <label>1</label>
                  <input type='radio' name='days' id='p' />
                </div>
                <div>
                  <label>2</label>
                  <input type='radio' name='days' id='b' />
                </div>
                <div>
                  <label>2</label>
                  <input type='radio' name='days' id='r' />
                </div>
                <div>
                  <label>4</label>
                  <input type='radio' name='days' id='n' />
                </div>
                <div>
                  <label>5</label>
                  <input type='radio' name='days' id='n' />
                </div>
              </fieldset>
            </form>
          </div>
          <button onClick={() => setShowFollow(false)}>Atrás</button>
          <button onClick={handleSend}>Enviar</button>
        </div>
      )}
    </div>
  );
};

export default forms;

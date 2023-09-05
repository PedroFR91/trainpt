import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaHamburger,
} from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { AiOutlineCloseSquare, AiOutlineMenu } from "react-icons/ai";
import { useState } from "react";
export default function Home() {
  const [viewmobile, setViewMobile] = useState(false);
  const sections = [
    {
      type: "image",
      text: "REINVENTA EL ENTRENAMIENTO PERSONAL ONLINE",
      src: "/logo.png",
    },
    {
      type: "video",
      text: "MANTEN EL CONTROL DE TODOS TUS CLIENTES",
      src: "",
    },
    { type: "image", text: "TU CALENDARIO DETALLADO", src: "/calendar.png" },
    {
      type: "image-carousel", // Cambia el tipo a "image-carousel"
      text: "TU CARTA DE PRESENTACIÓN PROFESIONAL",
      images: [
        "/cardtrainer.png",
        "/rates.png",
        "/clientimgone.png",
        "/clientimgtwo.png",
      ],
    },
    {
      type: "image",
      text: "AUTOMATIZA TU SEGUIMIENTO",
      src: "",
    },
    {
      type: "image-carousel", // Cambia el tipo a "image-carousel"
      text: "COMPARTE TODO CON TUS CLIENTES", // Mantén el mismo texto
      images: [
        "/gallery.png", // Cambia las imágenes a "gallery.png" y "videos.png"
        "/videos.png",
      ],
    },

    {
      type: "image",
      text: "DISFRUTA DE NUESTRO CREADOR DE RUTINAS",
      src: "Foto",
    },
  ];
  const toggleView = () => {
    setViewMobile(!viewmobile);
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Link href={"/"}>
              <img src={"/logo.png"} height="80px" />
            </Link>
          </div>
          <div className={styles.menu}>
            <Link href={"/#"} className={styles.underline}>
              Inicio
            </Link>
            <Link href={"/#"} className={styles.underline}>
              Conócenos
            </Link>
            <Link href={"/#"} className={styles.underline}>
              Preguntas Frecuentes
            </Link>
            <Link href={"/#"} className={styles.underline}>
              Información Legal
            </Link>
          </div>
          <div className={styles.mybutton}>
            <Link href={"/acceso"} className={styles.underline}>
              Accede
            </Link>
          </div>
          <AiOutlineMenu
            onClick={() => toggleView(true)}
            className={styles.hamburgerButton}
          />
        </div>
        {viewmobile && (
          <div className={styles.hamburger}>
            <div className={styles.menumobile}>
              <Link href={"/#"}>Inicio</Link>
              <Link href={"/#"}>Conócenos</Link>
              <Link href={"/#"}>Preguntas Frecuentes</Link>
              <Link href={"/#"}>Información Legal</Link>
            </div>
            <div className={styles.mybuttonmobile}>
              <Link href={"/acceso"}>Accede</Link>
            </div>
            <div className={styles.buttonclose} onClick={toggleView}>
              X
            </div>
          </div>
        )}
        <video
          src="/background.mp4"
          autoPlay
          loop
          muted
          style={{
            position: "fixed",
            width: "100%",
            left: "50%",
            top: "50%",
            height: "100%",
            objectFit: "cover",
            transform: "translate(-50%, -50%)",
            zIndex: "-10",
          }}
        />
        {sections.map((section, index) => (
          <div key={index} className={styles.section}>
            {index % 2 === 0 ? (
              <div className={styles.sectionContainer}>
                <div className={styles.media}>
                  {section.type === "image" ? (
                    <img src={section.src} width="100%" />
                  ) : (
                    <video
                      src={section.src}
                      width="100%"
                      height="100%"
                      autoPlay
                      loop
                      muted
                    />
                  )}
                </div>
                <div className={styles.text}>
                  <p>{section.text}</p>
                </div>
              </div>
            ) : (
              <div className={styles.sectionContainer}>
                <div className={styles.text}>{section.text}</div>
                {section.type === "image-carousel" ? (
                  <div className={styles.media}>
                    <div className={styles.carouselContainer}>
                      <Carousel
                        showArrows={true}
                        showThumbs={false}
                        autoPlay={true}
                        interval={2000}
                      >
                        {section.images.map((image, i) => (
                          <div key={i}>
                            <img src={image} alt={`Image ${i}`} />
                          </div>
                        ))}
                      </Carousel>
                    </div>
                  </div>
                ) : (
                  <div className={styles.media}>
                    {section.type === "image" ? (
                      <img src={section.src} width="100%" />
                    ) : (
                      <video
                        src={section.src}
                        width="100%"
                        height="100%"
                        autoPlay
                        loop
                        muted
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div className={styles.opinions}>
          <div className={styles.client}>
            <img src="/face2.jpg" />
            <div>
              "¡Increíble gimnasio en línea! Me encanta la variedad de rutinas y
              la comodidad de entrenar desde casa. Los instructores son muy
              motivadores, y he logrado resultados asombrosos. ¡No puedo
              recomendarlo lo suficiente!"
            </div>
            <div>Anna Gómez</div>
          </div>
          <div className={styles.client}>
            <img src="/face3.jpg" />
            <div>
              "Desde que me uní a este gimnasio en línea, mi vida ha cambiado.
              La plataforma es fácil de usar, y las rutinas son desafiantes pero
              efectivas. La comunidad en línea es un gran apoyo, y me siento más
              fuerte y saludable que nunca. ¡Una inversión que vale la pena!"
            </div>
            <div>Isabel Ramírez</div>
          </div>
          <div className={styles.client}>
            <img src="/face4.jpg" />
            <div>
              "Mi experiencia en este gimnasio en línea ha sido excepcional. La
              calidad de las clases y la atención personalizada son notables. He
              perdido peso, ganado fuerza y me siento más saludable que nunca.
              Además, la flexibilidad de entrenar en mi propio horario es
              invaluable. ¡Si buscas un gimnasio en línea de primera clase, este
              es el indicado!"
            </div>
            <div>Gabriel Pérez</div>
          </div>
        </div>
        <footer className={styles.footer}>
          <div className={styles.top}>
            <div className={styles.social}>
              <Link href="https://www.facebook.com">
                <div className={styles.links}>
                  <FaFacebookF size={24} />
                </div>
              </Link>
              <Link href="https://www.instagram.com">
                <div className={styles.links}>
                  <FaInstagram size={24} />
                </div>
              </Link>
              <Link href="https://www.tiktok.com">
                <div className={styles.links}>
                  <FaTiktok size={24} />
                </div>
              </Link>
              <Link href="https://www.linkedin.com/company">
                <div className={styles.links}>
                  <FaLinkedin size={24} />
                </div>
              </Link>
            </div>
            <div className={styles.legal}>
              <Link href={"/terminosycondiciones"} className={styles.underline}>
                Términos y condiciones &nbsp;
              </Link>
              |&nbsp;
              <Link href={"/privacidad"} className={styles.underline}>
                Política de privacidad &nbsp;
              </Link>
              |&nbsp;
              <Link href={"/cookies"} className={styles.underline}>
                Cookies
              </Link>
            </div>
            <div>2023 &copy; Train PT</div>
          </div>
          <div style={{ marginBottom: "1rem" }} className={styles.underline}>
            trainpt@info.es
          </div>
          <div>+34 123456789</div>
        </footer>
      </div>
    </>
  );
}

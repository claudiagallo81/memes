import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import "../App.css";

const MemeList = () => {
  const [memes, setMemes] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [phrase, setPhrase] = useState("");
  const memeRef = useRef(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const memesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await axios.get("https://api.imgflip.com/get_memes");
        setMemes(response.data.data.memes);
        setSelectedMeme(response.data.data.memes[0].id);
      } catch (error) {
        console.error("Error fetching memes:", error);
      }
    };

    fetchMemes();
  }, []);

  const handleSelectMeme = (memeId) => {
    setSelectedMeme(memeId);
  };

  const handlePhraseChange = (event) => {
    setPhrase(event.target.value);
  };

  const handleAddPhrase = () => {
    const updatedMemes = memes.map((meme) =>
      meme.id === selectedMeme ? { ...meme, userPhrase: phrase } : meme
    );
    setMemes(updatedMemes);
  };

  const handleDownloadMeme = () => {
    setDownloadReady(true);
  };

  useEffect(() => {
    if (downloadReady) {
      const downloadMeme = async () => {
        try {
          const meme = memes.find((meme) => meme.id === selectedMeme);
          const selectedMemeImage = new Image();
          selectedMemeImage.crossOrigin = "anonymous"; // Allow cross-origin loading
          selectedMemeImage.src = meme.url;

          selectedMemeImage.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = selectedMemeImage.width;
            canvas.height = selectedMemeImage.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(selectedMemeImage, 0, 0);

            if (phrase) {
              ctx.font = "30px Arial";
              ctx.fillStyle = "#ffffff";
              ctx.textAlign = "center";
              ctx.fillText(phrase, canvas.width / 2, canvas.height - 30);
            }

            const link = document.createElement("a");
            link.download = "meme_with_phrase.png";
            link.href = canvas.toDataURL("image/png");
            link.click();

            setDownloadReady(false);
          };
        } catch (error) {
          console.error("Error generating image:", error);
        }
      };

      downloadMeme();
    }
  }, [downloadReady, phrase, memes, selectedMeme]);

  const pages = Math.ceil(memes.length / memesPerPage);

  return (
    <div>
      <h1>Memes</h1>

      {/* Carrusel de memes */}
      <div className="carousel-container">
        <div className="carousel">
          <div className="carousel-row">
            {memes.slice(currentPage * memesPerPage, (currentPage + 1) * memesPerPage).map((meme) => (
              <div key={meme.id} className="carousel-item">
                <img
                  src={meme.url}
                  alt=""
                  onClick={() => handleSelectMeme(meme.id)}
                  className={meme.id === selectedMeme.id ? "selected" : ""}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="pagination">
          <button disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Anterior
          </button>
          <button disabled={currentPage === pages - 1} onClick={() => setCurrentPage((prev) => prev + 1)}>
            Siguiente
          </button>
        </div>
      </div>

      {/* Input para ingresar la frase */}
      <input
        type="text"
        value={phrase}
        onChange={handlePhraseChange}
        placeholder="Ingresa una frase para el meme"
      />

      {/* Botón para agregar la frase al meme */}
      <button onClick={handleAddPhrase}>Agregar Frase</button>

      {/* Botón para descargar el meme con la frase */}
      <button onClick={handleDownloadMeme}>Descargar Meme con Frase</button>

      {/* Vista del meme seleccionado */}
      <div className="meme-container">
        <div
          className="meme"
          ref={memeRef}
          onClick={() => handleSelectMeme(selectedMeme)}
        >
          {memes.map((meme) => meme.id === selectedMeme && (
            <img
              key={meme.id}
              src={meme.url}
              alt=""
            />
          ))}
          {memes.map((meme) => meme.id === selectedMeme && (
            <div className="user-phrase" key={meme.id}>
              {meme.userPhrase}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemeList;

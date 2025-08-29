import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState([]);
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [colors, setColors] = useState([]);
  const [status, setStatus] = useState("playing");

  const maxAttempts = 6;
  const maxGuesses = 6;
  const wordLength = targetWord.length || 5;

  useEffect(() => {
    fetch("/words.txt") // fetch from public folder
      .then(res => res.text())
      .then(text => {
        const wordList = text.split("\n").map(w => w.trim()).filter(Boolean)
        setWords(wordList)

        if (wordList.length > 0) {
          const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
          setTargetWord(randomWord)
        }
      })
      .catch(err => console.error("Fetch error:", err))
  }, [])

  const handleKey = (key) => {
    if(status !== "playing") return;

    if(key === "Enter") {
      if (currentGuess.length === targetWord.length && words.includes(currentGuess)) {

        const colorRow = currentGuess.split("").map((letter, i) => {
          if(letter === targetWord[i]) return "green";
          else if (targetWord.includes(letter)) return "yellow";
          else return "gray";
        }); 

        const newGuesses = [...guesses, currentGuess];
        const newColors = [...colors, colorRow];

        setGuesses(newGuesses);
        setColors(newColors);
        setCurrentGuess("");

        if(currentGuess === targetWord) {
          setStatus("won");
        }
        else if(newGuesses.length >= maxAttempts) {
          setStatus("lost");
        }

      }
    }
    else if (key === "Backspace") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < targetWord.length) {
      setCurrentGuess(currentGuess + key.toLowerCase())
    }
  };

  useEffect(() => {
    const listener = (e) => handleKey(e.key);
    window.addEventListener("keydown" ,listener);
    return () => window.removeEventListener("keydown", listener);
  });

  const restartGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setColors([]);
    setCurrentGuess("");
    setStatus("playing");
  }

  return (
    <div className="App">
      <h1>Albanian Wordle Copy</h1>
      {status === "won" && (<h2>🎉 You win!
        <button onClick={restartGame}>Restart</button></h2>
        )}
      {status === "lost" && (<h2>❌ You lose! The word was: {targetWord}{" "}
        <button onClick={restartGame}>Restart</button></h2>)}


      <div className="grid">
        {[...Array(maxGuesses)].map((_, i) => {
          const guess = guesses[i] || (i === guesses.length ? currentGuess : "");
          const colorRow = colors[i] || [];
          return (
            <div className="row" key={i}>
              {[...Array(wordLength)].map((_, j) => (
                <div 
                className={`cell ${colorRow[j] || ""}`}
                key={j}
                >
                  {guess[j] ? guess[j].toUpperCase() : ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App

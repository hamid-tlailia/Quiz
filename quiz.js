var toggle = document.getElementById("checkbox");
var storedTheme = window.localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

if (storedTheme) {
  document.body.classList.add(storedTheme);
  if (storedTheme === "dark") {
    toggle.checked = true;
  } else {
    toggle.checked = false;
  }
}

toggle.addEventListener("change", function() {
  var currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  var targetTheme = currentTheme === "light" ? "dark" : "light";

  document.body.classList.remove(currentTheme);
  document.body.classList.add(targetTheme);
  window.localStorage.setItem('theme', targetTheme);

  if (targetTheme === "dark") {
    toggle.checked = true;
  } else {
    toggle.checked = false;
  }
});

// get json data 
// control next btn 
var getNext = false;
var score = 0;
var sharedValue = "";
var sharedURI = window.location.href
 let currentQuestionIndex = 0; // Initialize the current question index
 // questions array
let questions = [];
const description = document.querySelector("#q-description")
// next question btn 
const nextBtn = document.getElementById("next")
// current questions track indicator
const indicator = document.querySelector("#total")
// score area
const scoreArea = document.querySelector("#score")
// loader
const loader = document.getElementById("loader")
// share btn 
const share = document.getElementById("share")
// quiz score modal open , close , level , correct attempts , wrong attempts and restart quiz
const openModal = document.getElementById("open-modal")
const closeModal = document.getElementById("close-modal")
const restartQuiz = document.getElementById("restart")
const level = document.getElementById("level")
const correctAttempts = document.getElementById("correct-attempts")
const wrongAttempts = document.getElementById("wrong-attempts")
// question description area
const guesArea = document.getElementById("gues")
// wrong , correct , finish game media files
const correctSong = document.getElementById("correct-answer")
const wrongSong = document.getElementById("wrong-answer")

const gameOver = document.getElementById("game-over")



async function fetchJSONData() {
  loader.classList.add("active")
  try {
    const response = await fetch("./quiz-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
setInterval(() => {
  loader.classList.remove("active")
},1000)
updateIndicator()
    const data = await response.json();
    console.log("Fetched data:", data); // Log data to inspect structure
    questions = data; // Assign the parsed data to questions
    // Call the function to render questions 
    renderQuestions();
    calculateScore()
  } catch (error) {
    console.error("Unable to fetch data:", error);
  }
}
// Function calculate score 
const calculateScore = () => {
  const result =100/questions.length
  var percentage = Number(Math.round( result *10)/10)
var scoreLevel = Math.floor(percentage*score)

level.textContent = scoreLevel + "%";
wrongAttempts.textContent = questions.length - score;
correctAttempts.textContent = score;
}

// Function to clear active classes
const clearActiveClasses = () => {
  // activeElements
  const activeElements = document.querySelectorAll('.active');
  activeElements.forEach(el => el
  .classList.remove('active'));
  // wrongElements
const wrongElements = document.querySelectorAll('.wrong');
  wrongElements.forEach(el => el.classList.remove('wrong'));
  // correctElements
  const correctElements = document.querySelectorAll('.correct');
  correctElements.forEach(el => el.classList.remove('correct'));
  // hide question description area
  guesArea.classList.remove("active")
  // off media 
  correctSong.pause()
  correctSong.currentTime=0;
  wrongSong.pause()
  wrongSong.currentTime=0;
  nextBtn.classList.add("disabled")
}

// Function to set active question
const setActiveQuestion = (index) => {
  clearActiveClasses();
  const questionAreas = document.querySelectorAll('.question-area');
  const optionsAreas = document.querySelectorAll('.options');
  const descriptionAreas = document.querySelectorAll('.q-description');

  if (questionAreas[index]) {
    questionAreas[index].querySelector('.question-text').classList.add('active');
  }
  if (optionsAreas[index]) {
    optionsAreas[index].classList.add('active');
  }
  if (descriptionAreas[index]) {
    descriptionAreas[index].classList.add('active');
    sharedValue = descriptionAreas[index].textContent
  }
}
// Function to handle option click
const handleOptionClick = (selectedOption, correctAnswer, optionElement) => {
  const info = optionElement.getAttribute("data-info")
  getNext = true;
  const qoptions = document.querySelectorAll(".options p")
qoptions.forEach(op => {
  if(op.getAttribute("data-info") === correctAnswer){
    op.classList.add("correct")
  }else {
    op.classList.add("wrong")
  }
})
  if(info === correctAnswer){
    score++;
    updateScore()
        // play correct song
    wrongSong.pause()
    wrongSong.currentTime = 0;
    correctSong.play()
  }else {
        // play wrong song
   correctSong.pause()
    correctSong.currentTime = 0;
    wrongSong.play() 
  }
  guesArea.classList.add("active")
  next.classList.remove("disabled")
calculateScore()
}
// Function to handle next button click
const handleNextButtonClick = () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    setActiveQuestion(currentQuestionIndex);
    updateIndicator()
  }else {
    calculateScore()
    openModal.click()
    gameOver.play()
  }
  updateIndicator();
  getNext=false;
}
// update indicator
const updateIndicator = () => {
  indicator.textContent = `
  ${currentQuestionIndex+1} /
  ${questions.length}
  `
}
const updateScore = () => {
  scoreArea.innerHTML = ` 
  النتيجة :
  ${score}
  `
}
// render questions
const renderQuestions = () => {
  var optionsArea = document.getElementById("questions-area");
  optionsArea.innerHTML = ""; // Clear previous content
  for (var q = 0; q < questions.length; q++) {
    console.log("Current question:", questions[q].correct_answer); // Log each question
    const correctAnswer = questions[q].correct_answer;
    console.log("Options property:", questions[q].options); // Log the options property

    if (typeof questions[q].options === 'object' && questions[q].options !== null) {
      var questionArea = document.createElement("div");
      questionArea.classList.add("question-area");

      var questionText = document.createElement("p");
      questionText.classList.add("question-text", "title");
      if (q === currentQuestionIndex) {
        questionText.classList.add("active");
      }
      questionText.textContent = q+1 + " - " + questions[q].question;

      var options = document.createElement("div");
      options.classList.add("options");
      if (q === currentQuestionIndex) {
        options.classList.add("active");
      }

      Object.keys(questions[q].options).forEach(key => {
        var optionP = document.createElement("p");
        optionP.textContent = questions[q].options[key];
        optionP.setAttribute("data-index", q);
        if(key === correctAnswer){
          optionP.setAttribute("data-info",correctAnswer)
        }else {
          optionP.setAttribute("data-info","wrong")
        }
        optionP.addEventListener('click', () => handleOptionClick(key, correctAnswer, optionP));
        options.appendChild(optionP);
      });

      var descriptionArea = document.createElement("div");
      descriptionArea.classList.add("q-description");
      descriptionArea.setAttribute("data-index", q);
      if (q === currentQuestionIndex) {
        descriptionArea.classList.add("active");
      }
      descriptionArea.textContent = questions[q].description;

      questionArea.appendChild(questionText);
      optionsArea.appendChild(questionArea);
      optionsArea.appendChild(options);
      description.appendChild(descriptionArea);
    } else {
      console.error(`Question ${q} does not have a valid options object`);
    }
  }
  updateIndicator()
}

// Add event listener to the next 
nextBtn.addEventListener('click', handleNextButtonClick);
// control next btn 
setInterval(() => {
  // update score 
  updateScore()
},100)
// share data btn Function

share.onclick = async () => {
  if (navigator.share) { // Check if the Web Share API is supported
    const sharedData = {
      url: sharedURI,
      text: sharedValue !== "" ? sharedValue : "السلام عليكم و رحمة الله ، ندعوكم الى مشاركة التطبيق ليعم الخير ."
    };
    try {
      await navigator.share(sharedData);
    } catch (error) {
      console.error('Error sharing data:', error);
    }
  } else {
    console.warn('Web Share API is not supported in this browser');
  }
};
// restart quiz btn Function
restart.onclick = () => {
  currentQuestionIndex=0;
    setActiveQuestion(currentQuestionIndex)
    score=0;
    updateIndicator()
    closeModal.click()
    gameOver.pause()
    gameOver.currentTime = 0;
}
fetchJSONData();
    









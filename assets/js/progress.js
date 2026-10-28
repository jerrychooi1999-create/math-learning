(function () {
  "use strict";

  const STORAGE_KEY = "myLearningHubProgressV1";

  function getRecords() {
    try {
      const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(records) ? records : [];
    } catch (_) {
      return [];
    }
  }

  function renderHomeProgress() {
    const count = document.getElementById("attemptCount");
    const latest = document.getElementById("latestScore");
    if (!count || !latest) return;

    const records = getRecords();
    count.textContent = records.length;

    if (!records.length) {
      latest.textContent = "暂无记录";
      return;
    }

    const r = records[records.length - 1];
    latest.textContent =
      `${r.course}: ${r.score}/${r.total} (${r.date})`;
  }

  function saveRecord(record) {
    const records = getRecords();
    records.push({ ...record, date: new Date().toLocaleDateString() });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-100)));
    } catch (error) {
      console.warn("无法保存学习记录。", error);
    }
    renderHomeProgress();
  }

  const clearButton = document.getElementById("clearProgress");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      if (!confirm("确定清除这台设备上的学习记录吗？")) return;
      localStorage.removeItem(STORAGE_KEY);
      renderHomeProgress();
    });
  }

  const quiz = window.lessonQuiz;
  const quizRoot = document.getElementById("quizRoot");

  if (quiz && quizRoot) {
    const answers = {};
    let submitted = false;

    quizRoot.innerHTML = `
      <p>已作答：<strong id="answeredCount">0</strong> / ${quiz.length}</p>
      <div class="progress-track"><div id="quizProgress" class="progress-fill"></div></div>
      <div id="questionList"></div>
      <div id="scoreBox" class="score-box">
        <div id="scoreNumber" class="score-number"></div>
        <p id="scoreMessage"></p>
      </div>
      <button class="button" id="submitQuiz" type="button">检查答案</button>
      <button class="button secondary" id="resetQuiz" type="button">重新作答</button>
    `;

    const questionList = document.getElementById("questionList");

    function renderQuiz() {
      questionList.innerHTML = "";

      quiz.forEach((item, i) => {
        const [level, question, options] = item;
        const section = document.createElement("section");
        section.className = "question";

        const heading = document.createElement("h3");
        heading.textContent = `[${level}] ${i + 1}. ${question}`;
        section.appendChild(heading);

        const optionList = document.createElement("div");
        optionList.className = "options";

        options.forEach((option, j) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "option";
          button.textContent = `${String.fromCharCode(65 + j)}. ${option}`;

          button.addEventListener("click", function () {
            if (submitted) return;
            answers[i] = j;
            optionList.querySelectorAll("button").forEach(
              b => b.classList.remove("selected")
            );
            button.classList.add("selected");
            updateProgress();
          });

          optionList.appendChild(button);
        });

        section.appendChild(optionList);
        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.id = `feedback-${i}`;
        section.appendChild(feedback);
        questionList.appendChild(section);
      });

      updateProgress();
    }

    function updateProgress() {
      const count = Object.keys(answers).length;
      document.getElementById("answeredCount").textContent = count;
      document.getElementById("quizProgress").style.width =
        `${count / quiz.length * 100}%`;
    }

    document.getElementById("submitQuiz").addEventListener("click", function () {
      if (submitted) return;

      if (Object.keys(answers).length !== quiz.length) {
        alert(`你还需要回答 ${quiz.length - Object.keys(answers).length} 题。`);
        return;
      }

      submitted = true;
      let score = 0;

      quiz.forEach((item, i) => {
        const [, , options, correct, explanation] = item;
        const buttons = questionList.children[i].querySelectorAll(".option");

        buttons.forEach((button, j) => {
          if (j === correct) button.classList.add("correct");
          if (j === answers[i] && j !== correct) button.classList.add("wrong");
        });

        const isCorrect = answers[i] === correct;
        if (isCorrect) score++;

        document.getElementById(`feedback-${i}`).textContent =
          `${isCorrect ? "✓ 答对了！" : `✗ 正确答案：${options[correct]}。`} ${explanation}`;
      });

      document.getElementById("scoreNumber").textContent =
        `${score} / ${quiz.length}`;

      document.getElementById("scoreMessage").textContent =
        score >= quiz.length * 0.9 ? "优秀！继续保持。" :
        score >= quiz.length * 0.75 ? "做得不错，请复习错题。" :
        "建议先复习课文，再重新练习。";

      document.getElementById("scoreBox").classList.add("show");
      document.getElementById("submitQuiz").disabled = true;

      saveRecord({
        course: window.lessonTitle || "数学课程",
        score,
        total: quiz.length
      });
    });

    document.getElementById("resetQuiz").addEventListener("click", function () {
      Object.keys(answers).forEach(key => delete answers[key]);
      submitted = false;
      document.getElementById("scoreBox").classList.remove("show");
      document.getElementById("submitQuiz").disabled = false;
      renderQuiz();
    });

    renderQuiz();
  }

  window.LearningProgress = { getRecords, saveRecord, renderHomeProgress };
  renderHomeProgress();
})();

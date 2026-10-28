
(function () {
  "use strict";

  const STORAGE_KEY = "myLearningHubProgressV1";

  function getRecords() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function saveRecord(record) {
    const records = getRecords();
    records.push({
      ...record,
      date: new Date().toLocaleDateString()
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-100)));
    } catch (error) {
      console.warn("无法保存学习记录。", error);
    }

    renderHomeProgress();
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

    const item = records[records.length - 1];
    latest.textContent =
      `${item.course}: ${item.score}/${item.total} (${item.date})`;
  }

  const clearButton = document.getElementById("clearProgress");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      if (!confirm("确定清除这台设备保存的所有学习记录吗？")) return;
      localStorage.removeItem(STORAGE_KEY);
      renderHomeProgress();
    });
  }

  window.LearningProgress = {
    getRecords,
    saveRecord,
    renderHomeProgress
  };

  renderHomeProgress();
})();

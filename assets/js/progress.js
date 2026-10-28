const LearningProgress = {
  key: "myLearningHubProgressV1",

  getAll() {
    try {
      return JSON.parse(
        localStorage.getItem(this.key) || "[]"
      );
    } catch {
      return [];
    }
  },

  save(course, score, total) {
    const records = this.getAll();

    records.push({
      course,
      score,
      total,
      date: new Date().toISOString()
    });

    try {
      localStorage.setItem(
        this.key,
        JSON.stringify(records.slice(-200))
      );
    } catch (error) {
      console.warn("无法保存学习记录。", error);
    }
  },

  getSummary() {
    const records = this.getAll();

    return {
      attempts: records.length,
      latest: records.length
        ? records[records.length - 1]
        : null
    };
  }
};

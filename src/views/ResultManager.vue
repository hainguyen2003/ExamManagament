<template>
  <div class="exam-manager">
    <h2 class="form-title">Thống kê file kết quả</h2>
    <p>Danh sách các file đã được cập nhật:</p>

    <!-- DANH SÁCH CÁC CA THI -->
    <section class="list-section">
      <table class="table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã ca</th>
            <th>Thời gian upload</th>
            <th>Xem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, index) in summaryFilesOnly" :key="file.id">
            <td>{{ index + 1 }}</td>
            <td>{{ extractSessionCode(file.fileName) }}</td>
            <td>{{ formatDate(file.uploadTime) }}</td>
            <td>
              <button
                class="btn btn-primary"
                @click="toggleSessionView(file.fileName)"
              >
                {{
                  selectedFileName === file.fileName
                    ? " Ẩn"
                    : " Xem"
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- CHI TIẾT CA THI -->
    <section v-if="selectedSession" class="form-section blue-bg">
      <hr />
      <h3 class="form-title">Kết quả ca thi:</h3>
      <p>
        <strong>Mã ca:</strong> {{ selectedSession.sessionCode }}
        <strong>Môn:</strong> {{ selectedSession.subject }}
      </p>

      <div class="scroll-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Điểm</th>
              <th>Ghi chú</th>
              <th>Xem bài làm</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, idx) in selectedSession.students"
              :key="s.studentId"
            >
              <td>{{ idx + 1 }}</td>
              <td>{{ s.studentId }}</td>
              <td>{{ s.name }}</td>
              <td>{{ s.score }}</td>
              <td>{{ s.note || "" }}</td>
              <td>
                <button
                  class="btn btn-secondary"
                  @click="toggleStudentAnswerView(findStudentAnswerFile(s.studentId))"
                  :disabled="!findStudentAnswerFile(s.studentId)"
                  style="color: cornflowerblue"
                >
                  {{
                    selectedStudentAnswers &&
                    selectedStudentAnswers.studentId === s.studentId
                      ? " Ẩn"
                      : " Đ/A bài thi"
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BÀI LÀM SINH VIÊN -->
    <section v-if="selectedStudentAnswers" class="form-section green-bg">
      <hr />
      <h3 class="form-title">Đáp án bài thi</h3>
      <p>
        <strong>Mã SV:</strong> {{ selectedStudentAnswers.studentId }}
        <strong>Tên đề:</strong> {{ selectedStudentAnswers.examFileName }}
        <strong>Điểm:</strong> {{ selectedStudentAnswers.score }}
      </p>

      <div class="scroll-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Đáp án chọn</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in Object.entries(
                selectedStudentAnswers.answers
              )"
              :key="entry[0]"
            >
              <td>Câu {{ index + 1 }}:</td>
              <td>{{ entry[1].join(", ") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  name: "ResultManager",
  data() {
    return {
      resultFiles: [],
      selectedFileName: "",
      selectedSession: null,
      selectedStudentAnswers: null
    };
  },
  computed: {
    summaryFilesOnly() {
      const summaries = this.resultFiles.filter((f) =>
        /\/result_summary\.json$/.test(f.fileName)
      );
      const uniqueMap = new Map();
      summaries.forEach((file) => {
        const match = file.fileName.match(
          /^result-json\/([^/]+)\/result_summary\.json$/
        );
        if (match) {
          const sessionCode = match[1];
          if (!uniqueMap.has(sessionCode)) {
            uniqueMap.set(sessionCode, file);
          }
        }
      });
      return Array.from(uniqueMap.values());
    }
  },
  methods: {
    async fetchResultFiles() {
      try {
        this.resultFiles = await api.get("/result-files/all");
      } catch (err) {
        console.error("❌ Lỗi khi tải file:", err);
      }
    },
    async toggleSessionView(fileName) {
      if (this.selectedFileName === fileName) {
        // Nếu đang xem -> ẩn đi
        this.selectedSession = null;
        this.selectedFileName = "";
        this.selectedStudentAnswers = null;
      } else {
        await this.viewFile(fileName);
      }
    },
    async viewFile(fileName) {
      const trimmed = fileName.replace(/^result-json\//, "");
      try {
        const content = await api.get("/result-files/view", {
          params: { fileName: trimmed }
        });
        this.selectedSession = content;
        this.selectedFileName = fileName;
        this.selectedStudentAnswers = null;
      } catch (err) {
        console.error("❌ Không xem được file:", err);
        this.selectedSession = null;
      }
    },
    findStudentAnswerFile(studentId) {
      const sessionCode = this.selectedSession?.sessionCode || "";
      const regex = new RegExp(`${sessionCode}/${studentId}_.+\\.json$`);
      const file = this.resultFiles.find((f) => regex.test(f.fileName));
      return file?.fileName || null;
    },
    async toggleStudentAnswerView(fileName) {
      if (
        this.selectedStudentAnswers &&
        this.selectedStudentAnswers.fileName === fileName
      ) {
        // Ẩn nếu đang mở file này
        this.selectedStudentAnswers = null;
      } else {
        await this.viewStudentAnswerFile(fileName);
      }
    },
    async viewStudentAnswerFile(fileName) {
      if (!fileName) return;
      try {
        const trimmed = fileName.replace(/^result-json\//, "");
        const content = await api.get("/result-files/view", {
          params: { fileName: trimmed }
        });
        content.fileName = fileName; // lưu để toggle
        this.selectedStudentAnswers = content;
      } catch (err) {
        console.error(" Không xem được bài làm:", err);
      }
    },
    extractSessionCode(fileName) {
      const match = fileName.match(/^result-json\/([^/]+)\//);
      return match ? match[1] : fileName;
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString("vi-VN");
    }
  },
  mounted() {
    this.fetchResultFiles();
  }
};
</script>

<style scoped src="./ResultManager.css"></style>

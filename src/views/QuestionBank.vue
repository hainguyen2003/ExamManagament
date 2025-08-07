 <template>
  <div class="generated-exam-manager">
    <h2>Thêm câu hỏi vào ngân hàng câu hỏi</h2>

    <div class="filter-bar">
      <label>Chọn môn thi:</label>
      <select v-model="selectedExamId">
        <option value="">-- chọn môn --</option>
        <option v-for="exam in exams" :key="exam.id" :value="exam.id">
          {{ exam.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedExamId" class="question-bank">
      <div class="question-count-input">
        <label>Thêm số lượng câu hỏi:</label>
        <input type="number" v-model.number="newQuestionCount" min="1" max="50" />
        <button @click="addMultipleQuestions">Thêm</button>
      </div>

      <div class="scroll-wrapper">
        <div v-for="(q, index) in questions" :key="index" class="question-block">
          <h4>Câu {{ index + 1 }}:</h4>

          <div class="meta-row">
            <label>Mức độ:</label>
            <select v-model="q.difficulty" style="border-radius: 4px; width: 11%; height: 33px;">
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>

            <label style="margin-left: 10px;">Chọn nhiều:</label>
            <input type="checkbox" v-model="q.multipleChoice" />
          </div>

          <textarea v-model="q.content" placeholder="Nhập nội dung câu hỏi..." />

          <div v-for="(a, i) in q.answers" :key="i" class="answer-row">
            <input style="border-radius: 4px; width: 52%; height: 28px;" v-model="a.content" placeholder="Đáp án" />
            <label><input type="checkbox" v-model="a.correct" /> Đúng</label>
          </div>

          <button class="button-delete" @click="removeQuestion(index)">❌ Xoá</button>
          <hr />
        </div>
      </div>

      <button @click="saveQuestions"> Lưu </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const exams = ref([])
const selectedExamId = ref('')
const questions = ref([])
const newQuestionCount = ref(1)
const toast = useToast()

onMounted(loadExams)

async function loadExams() {
  try {
    const res = await api.get('/exams')
    exams.value = res.data.items || res.data
  } catch (err) {
    toast.error('Lỗi tải môn thi: ' + err.message)
  }
}

function addMultipleQuestions() {
  const count = Math.max(1, Math.min(newQuestionCount.value || 1, 50))
  for (let i = 0; i < count; i++) {
    questions.value.push({
      content: '',
      score: 1,
      difficulty: 'EASY',
      multipleChoice: false,
      answers: [
        { content: '', correct: false },
        { content: '', correct: false },
        { content: '', correct: false },
        { content: '', correct: false }
      ]
    })
  }
}

function removeQuestion(index) {
  questions.value.splice(index, 1)
}

async function saveQuestions() {
  try {
    for (let index = 0; index < questions.value.length; index++) {
      const q = questions.value[index];

      //  Kiểm tra nội dung câu hỏi
      if (!q.content || q.content.trim() === "") {
        toast.warning(`⚠️ Câu ${index + 1}: Vui lòng nhập nội dung câu hỏi!`);
        return;
      }

      //  Kiểm tra ít nhất một đáp án có nội dung
      const filledAnswers = q.answers.filter(a => a.content.trim() !== "");
      if (filledAnswers.length === 0) {
        toast.warning(`⚠️ Câu ${index + 1}: Vui lòng nhập ít nhất một đáp án!`);
        return;
      }

      //  Kiểm tra ít nhất một đáp án đúng
      const hasCorrect = filledAnswers.some(a => a.correct);
      if (!hasCorrect) {
        toast.warning(`⚠️ Câu ${index + 1}: Vui lòng chọn ít nhất một đáp án đúng!`);
        return;
      }

      // . Tự động bỏ các đáp án rỗng trước khi gửi
      const cleanedAnswers = filledAnswers.map(a => ({
        content: a.content.trim(),
        correct: a.correct
      }));

      //  Gửi API
      const payload = {
        ...q,
        examId: selectedExamId.value,
        answers: cleanedAnswers
      };

      await api.post("/question-bank", payload);
    }

    toast.success(" Đã lưu toàn bộ câu hỏi vào ngân hàng.");
    questions.value = [];
  } catch (err) {
    toast.error(" Lỗi khi lưu: " + err.message);
  }
}

</script>

<style scoped src="./GeneratedExamManager.css"></style>

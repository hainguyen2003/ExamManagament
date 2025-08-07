<template>
  <div class="exam-generator">
    <section class="form-section blue-bg">
      <h2 class="form-title">Tạo đề thi</h2>

      <div class="form-row">
        <label>Tên bộ đề:</label>
        <input v-model="form.name" placeholder="Nhập tên đề thi" />
      </div>

      <div class="form-row">
        <label>Chọn môn thi:</label>
        <select v-model="form.examId" @change="fetchQuestionSets">
          <option disabled value="">-- Chọn môn thi --</option>
          <option v-for="exam in exams" :key="exam.id" :value="exam.id">{{ exam.name }}</option>
        </select>
      </div>

      <div class="form-row">
        <label>Số câu hỏi:</label>
        <input type="number" v-model.number="form.totalQuestions" min="1" />
      </div>

      <div class="form-row">
        <label>Thời gian làm bài (phút):</label>
        <input type="number" v-model.number="form.duration" min="1" />
      </div>

      <div class="form-row">
        <label>Quy chuẩn đề (%):</label>
        <div class="difficulty-group">
          <div><span>Dễ:</span><input type="number" v-model.number="form.easyPercent" /></div>
          <div><span>Trung bình:</span><input type="number" v-model.number="form.mediumPercent" /></div>
          <div><span>Khó:</span><input type="number" v-model.number="form.hardPercent" /></div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" :disabled="!isValid" @click="submit">Tạo đề</button>
      </div>

      <p v-if="message" class="result-message">{{ message }}</p>
    </section>

    <section class="form-section" v-if="questionSets.length">
      <h3> Danh sách đề thi đã tạo:</h3>
      <ul>
        <li v-for="qs in questionSets" :key="qs.id">
          📝 {{ qs.name }} | Thời gian: {{ qs.duration }} phút | Enabled: {{ qs.enabled ? '✔️' : '❌' }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const message = ref('')
const exams = ref([])
const questionSets = ref([])

const form = ref({
  name: '',
  examId: '',
  totalQuestions: 20,
  duration: 30,
  easyPercent: 40,
  mediumPercent: 40,
  hardPercent: 20
})

const isValid = computed(() => {
  const total = form.value.easyPercent + form.value.mediumPercent + form.value.hardPercent;
  return (
    form.value.name.trim() !== "" &&        
    form.value.examId &&                    
    form.value.totalQuestions > 0 &&
    form.value.duration > 0 &&
    total === 100
  );
});

onMounted(async () => {
  try {
    const res = await axios.get('/exams')
    exams.value = res.data?.items || []
  } catch (err) {
    toast.error('❌ Không tải được danh sách kỳ thi.')
  }
})

const fetchQuestionSets = async () => {
  if (!form.value.examId) return
  try {
    const res = await axios.get(`/question-sets/exam/${form.value.examId}`)
    questionSets.value = res.data || []
  } catch (err) {
    toast.error('❌ Không thể tải danh sách đề thi .')
  }
}

const submit = async () => {
  if (!form.value.name.trim()) {
    toast.warning(" Vui lòng nhập tên đề!");
    return;
  }
  if (!form.value.examId) {
    toast.warning(" Vui lòng chọn môn thi!");
    return;
  }
  const total = form.value.easyPercent + form.value.mediumPercent + form.value.hardPercent;
  if (total !== 100) {
    toast.warning(" Quy chuẩn đề phải bằng 100%!");
    return;
  }

  try {
    await axios.post('/generated-exams', form.value);
    toast.success(' Đã tạo đề: ' + form.value.name);
    await fetchQuestionSets();
    message.value = `Đã tạo đề "${form.value.name}"`;
  } catch (err) {
    toast.error(err.response?.data || ' Lỗi khi tạo đề thi.');
  }
};

</script>

 <style scoped src="./GeneratedExam.css">
</style>

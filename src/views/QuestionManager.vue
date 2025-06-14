<template>
  <div class="question-manager">
    <h2 class="page-title">Cập nhật đề & đáp án</h2>

    <!-- Chọn kỳ thi -->
    <div class="exam-selector">
      <label>Chọn kỳ thi:</label>
      <select v-model="selectedExamId" @change="loadQuestionSets">
        <option value="">-- chọn kỳ thi --</option>
        <option v-for="exam in exams" :key="exam.id" :value="exam.id">
          {{ exam.name }}
        </option>
      </select>
    </div>

    <!-- Upload file -->
    <div v-if="selectedExamId" class="upload-section">
      <label> File đề thi (Excel):</label>
      <input type="file" multiple @change="e => files = Array.from(e.target.files)" />
      <button class="upload-btn" @click="uploadQuestionFiles"> Upload</button>
    </div>

    <!-- Danh sách bộ đề -->
    <div v-if="questionSets.length > 0" class="card">
      <h3>Các bộ đề trong kỳ thi:</h3>
      <ul class="question-set-list">
        <li v-for="set in questionSets" :key="set.id">
          <div class="set-info">
            📄 {{ set.name }} – <span>{{ set.questionCount }} câu</span>
          </div>
          <button class="delete-btn" @click="deleteSet(set.id)">🗑️ Xoá</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../services/api';
import { useToast } from 'vue-toastification';

const toast = useToast();
const exams = ref([]);
const selectedExamId = ref(null);
const questionSets = ref([]);
const files = ref([]);

onMounted(async () => {
  const res = await axios.get('/exams');
  exams.value = res.data;
});

async function loadQuestionSets() {
  if (!selectedExamId.value) return;
  const res = await axios.get(`/question-sets/exam/${selectedExamId.value}`);
  questionSets.value = res.data;
}

async function uploadQuestionFiles() {
  if (!selectedExamId.value || files.value.length === 0) {
    toast.warning('⚠️ Vui lòng chọn kỳ thi và file.');
    return;
  }

  const formData = new FormData();
  files.value.forEach(file => formData.append('files', file));

  try {
    const res = await axios.post(
      `/questions/import/upload-multi/${selectedExamId.value}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    toast.success('✅ ' + res.data);
    loadQuestionSets();
  } catch (err) {
    toast.error('❌ Upload thất bại: ' + err.message);
  }
}

async function deleteSet(setId) {
  if (!confirm('Bạn có chắc muốn xoá bộ đề và toàn bộ câu hỏi của nó?')) return;
  try {
    await axios.delete(`/question-sets/${setId}`);
    toast.success('🗑️ Đã xoá bộ đề thành công');
    loadQuestionSets();
  } catch (err) {
    toast.error('❌ Xoá thất bại: ' + err.message);
  }
}
</script>

<style scoped>
.question-manager {
  background: #eae9f4;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: 'Segoe UI', sans-serif;
  border-radius: 6px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #123456;
}

.exam-selector,
.upload-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.exam-selector select ,
.upload-section input[type="file"] {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #f7f5f5;
}

.upload-btn {
  background-color: #31bc24;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 12px;
}

.upload-btn:hover {
  background-color: #6ddf16;
}

.card {
  background-color: #f5faff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-top: 24px;
}

.question-set-list {
  list-style: none;
  padding: 0;
  margin-top: 12px;
}

.question-set-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ccc;
}

.set-info {
  font-size: 16px;
}

.delete-btn {
  background-color: #f44336;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.delete-btn:hover {
  background-color: #c62828;
}
</style>

<template>
  <div class="exam-manager">
    <!-- TẠO KỲ THI -->
    <div class="card form-card">
      <h2 class="form-title"> Tạo kỳ thi mới</h2>

      <div class="form-table">
        <div class="form-row">
          <label for="name">Tên kỳ thi:</label>
          <input id="name" v-model="name" placeholder="Nhập tên kỳ thi" />
        </div>

        <div class="form-row">
          <label for="description">Mô tả:</label>
          <input id="description" v-model="description" placeholder="Mô tả kỳ thi" />
        </div>

        <div class="form-row">
          <label for="start">Bắt đầu:</label>
          <input id="start" type="datetime-local" v-model="startTime" />
        </div>

        <div class="form-row">
          <label for="end">Kết thúc:</label>
          <input id="end" type="datetime-local" v-model="endTime" />
        </div>

        <div class="form-submit">
          <button class="primary-btn" @click="createExam"> Tạo kỳ thi</button>
        </div>
      </div>
    </div>

    <div class="card upload-card" v-if="createdExam">
      <h3 class="upload-title">
         Cập nhật bộ đề cho: <strong>{{ createdExam.name }}</strong> (ID: {{ createdExam.id }})
      </h3>

      <div class="upload-group">
        <label class="upload-label">Chọn file Excel (1 / nhiều):</label>
        <input type="file" multiple @change="handleFileChange" class="upload-input" />

        <div class="file-preview" v-if="files.length">
          <ul>
            <li v-for="(file, index) in files" :key="index" class="file-item">
              📄 {{ file.name }}
            </li>
          </ul>
        </div>

        <button class="upload-btn" @click="uploadFiles"> Update</button>
      </div>
    </div>

    <div class="list-card">
      <h3> Danh sách kỳ thi</h3>
      <table class="exam-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exam in exams" :key="exam.id">
            <td>{{ exam.id }}</td>
            <td>{{ exam.name }}</td>
            <td>{{ exam.startTime?.replace('T', ' ') }}</td>
            <td>{{ exam.endTime?.replace('T', ' ') }}</td>
            <td>
              <button class="delete-btn" @click="deleteExam(exam.id)">🗑️ Xoá</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../services/api';
import { useToast } from 'vue-toastification';

const toast = useToast();

const name = ref('');
const description = ref('');
const startTime = ref('');
const endTime = ref('');
const files = ref([]);
const createdExam = ref(null);
const exams = ref([]);

onMounted(fetchExams);

async function fetchExams() {
  try {
    const res = await axios.get('/exams');
    exams.value = res.data;
  } catch (err) {
    toast.error('❌ Không thể tải danh sách kỳ thi.');
  }
}

async function createExam() {
  try {
    const response = await axios.post('/exams', {
      name: name.value,
      description: description.value,
      startTime: startTime.value,
      endTime: endTime.value,
      questionCount: 0
    });
    createdExam.value = response.data;
    exams.value.push(response.data);
    toast.success(`✅ Đã tạo kỳ thi: ${createdExam.value.name}`);
  } catch (err) {
    toast.error('❌ Lỗi khi tạo kỳ thi: ' + err.message);
  }
}

function handleFileChange(e) {
  files.value = Array.from(e.target.files);
}

async function uploadFiles() {
  if (!createdExam.value?.id || files.value.length === 0) {
    toast.warning('⚠️ Chưa chọn file hoặc chưa có kỳ thi.');
    return;
  }

  const formData = new FormData();
  files.value.forEach((file) => formData.append('files', file));

  try {
    const res = await axios.post(
      `/questions/import/upload-multi/${createdExam.value.id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    toast.success(` Kết quả update:\n${res.data}`);
  } catch (err) {
    toast.error('❌ Upload thất bại: ' + err.message);
  }
}

async function deleteExam(id) {
  if (!confirm('Bạn có chắc muốn xoá kỳ thi này?')) return;
  try {
    await axios.delete(`/exams/${id}`);
    exams.value = exams.value.filter(e => e.id !== id);
    toast.success(`🗑️ Đã xoá kỳ thi ID: ${id}`);
  } catch (err) {
    toast.error('❌ Không thể xoá kỳ thi: ' + err.message);
  }
}
</script>

<style scoped>
.exam-manager {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: 'Segoe UI', sans-serif;
}

/* Tạo kỳ thi */
.form-card {
  margin-top: 20px;
  background: #d0f3f7;
  border-radius: 6.8px;
}

.form-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: bold;
  color: #f25b5b;
}

.form-table {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-row label {
  width: 160px;
  font-weight: 600;
  color: #333;
}

.form-row input {
  flex: 1;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #fbf6f6;
  border-radius: 6px;
}

.form-submit {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.primary-btn {
  background-color: #1976d2;
  color: white;
  padding: 12px 28px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-btn:hover {
  background-color: #145ea8;
}

/* Upload đề */
.upload-card {
  background: #f4f8e7;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #0d3c61;
  margin-bottom: 20px;
}

.upload-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.upload-label {
  font-weight: 500;
  color: #333;
}

.upload-input {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.file-preview ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.file-item {
  font-size: 15px;
  margin-bottom: 4px;
  color: #444;
}

.upload-btn {
  margin-top: 12px;
  padding: 12px 28px;
  font-size: 16px;
  font-weight: bold;
  background-color: #0cba23;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-btn:hover {
  background-color: #62d70e;
}

/* Danh sách kỳ thi */
.list-card {
  margin-top: 25px;
  background: #deecb8;
  border-radius: 6.8px;
}

.exam-table {
  width: 100%;
  margin-top: 12px;
  border-collapse: collapse;
}

.exam-table th,
.exam-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.delete-btn {
  background-color: #e53935;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c62828;
}
</style>

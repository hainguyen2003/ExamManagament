<template>
  <div class="exam-manager">
    <div class="view-switch">
      <button :class="['switch-btn', view === 'create' ? 'active' : '']" @click="view = 'create'">Tạo mới</button>
      <button :class="['switch-btn', view === 'update' ? 'active' : '']" @click="switchToUpdate">Cập nhật</button>
    </div>

    <!-- TẠO Môn THI -->
    <div v-if="view === 'create'">
      <section class="form-section blue-bg">
        <h2 class="form-title">Tạo môn thi mới</h2>
        <div class="form-row">
          <label>Tên môn thi:</label>
          <input v-model="form.name" placeholder="Nhập tên môn thi" />
        </div>
        <div class="form-row">
          <label>Mô tả:</label>
          <input v-model="form.description" placeholder="Mô tả môn thi" />
        </div>
        <div class="form-row">
          <label>Bắt đầu:</label>
          <input type="datetime-local" v-model="form.startTime" />
        </div>
        <div class="form-row">
          <label>Kết thúc:</label>
          <input type="datetime-local" v-model="form.endTime" />
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="submitExam">{{ editExam ? 'Cập nhật' : 'Tạo mới' }}</button>
          <button v-if="editExam" class="btn btn-secondary" @click="cancelEdit">Hủy</button>
        </div>
      </section>

      <section class="list-section">
        <h3>Danh sách môn thi</h3>
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Tên</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            <tr v-for="exam in exams" :key="exam.id">
              <td>{{ exam.id }}</td>
              <td>{{ exam.name }}</td>
              <td>{{ formatDate(exam.startTime) }}</td>
              <td>{{ formatDate(exam.endTime) }}</td>
              <td>
                <button class="btn-edit" @click.stop="startEdit(exam)">✏️</button>
                <button class="btn-delete" @click.stop="deleteExam(exam.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- CẬP NHẬT ĐỀ & ĐÁP ÁN -->
    <div v-if="view === 'update'">
      <section class="form-section purple-bg">
        <h2 class="form-title">Cập nhật đề & đáp án</h2>
        <div class="form-row">
          <label>Chọn môn thi:</label>
          <select v-model="selectedExamId">
            <option value="">-- chọn môn thi --</option>
            <option v-for="exam in exams" :key="exam.id" :value="exam.id">{{ exam.name }}</option>
          </select>
        </div>

        <div v-if="selectedExamId">
          <div class="form-row vertical-upload">
            <div class="form-row">
              <label>File đề thi (Excel):</label>
              <input type="file" multiple @change="onFileChange" class="file-input"/>
            </div>
            <div class="form-row" style="justify-content: flex-end">
              <button class="btn btn-success" @click="uploadFiles">Upload</button>
            </div>
          </div>

          <section class="question-sets">
            <h3 class="question-set-title">Các bộ đề trong môn thi:</h3>
            <ul v-if="questionSets.length > 0">
              <li v-for="set in questionSets" :key="set.id" class="set-row">
                <div class="set-info">
                  <input type="checkbox" :checked="set.enabled" @change="toggleEnabled(set)" />
                  <span class="set-title">{{ stripExtension(set.name) }}</span>
                  <span v-if="set.lastUsedAt" class="set-used-at">Đã sử dụng: {{ formatFullDate(set.lastUsedAt) }}</span>
                </div>
                <div class="set-actions">
                  <button class="btn-delete" @click="deleteSet(set.id)">🗑️ Xoá</button>
                  <button class="btn btn-primary" @click="togglePreview(set)">
                    {{ isPreviewing(set.id) ? 'Ẩn' : 'Xem' }}
                  </button>
                </div>
              </li>
            </ul>
            <p v-else style="text-align: center; color: #999;">Không có bộ đề nào trong môn thi này.</p>
          </section>

          <!-- ✅ Hiển thị nội dung đề -->
          <!-- <div v-if="previewContent.length > 0 && previewSetId" class="preview-box"> -->
            <div v-if="Array.isArray(previewContent) && previewContent.length > 0 && previewSetId" class="preview-box">
            <h4 style="margin-bottom: 16px; display: flex; justify-content: center;">
              Nội dung đề: {{ previewTitle }}
            </h4>
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 60px;">STT</th>
                  <th>Nội dung câu hỏi</th>
                  <th style="min-width: 240px;">Các đáp án</th>
                  <th style="width: 80px; text-align: center;">Điểm</th> 
                </tr>
              </thead>
              <tbody>
                <tr v-for="(q, index) in previewContent" :key="index">
                  <td style="text-align: center;">{{ index + 1 }}</td>
                  <td>{{ q.content }}</td>
                  <td>
                    <div v-for="(a, i) in q.answers || []" :key="i" class="answer-block">
                      <!-- <span :style="{ fontWeight: a.correct ? 'bold' : 'normal' }"> -->
                        <span>
                        {{ String.fromCharCode(65 + i) }}. {{ a.content }}
                      </span>
                    </div>
                  </td>
                  <td style="text-align: center;">{{ (q.score ?? 0).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import axios from '../services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const view = ref('create')
const form = ref({ name: '', description: '', startTime: '', endTime: '' })
const exams = ref([])
const editExam = ref(null)
const selectedExamId = ref(null)
const questionSets = ref([])
const files = ref([])
const previewContent = ref([])
const previewTitle = ref("")
const previewSetId = ref(null)

onMounted(loadExams)

watch(selectedExamId, async (newId) => {
  if (newId !== null && newId !== "") {
    await loadQuestionSets()
  } else {
    questionSets.value = []
  }
})

function switchToUpdate() {
  view.value = 'update'
  nextTick(() => {
    if (selectedExamId.value) loadQuestionSets()
  })
}

async function loadExams() {
  try {
    const res = await axios.get('/exams')
    exams.value = res.data?.items || []
  } catch (err) {
    toast.error("❌ Lỗi tải danh sách kỳ thi: " + err.message)
  }
}

async function loadQuestionSets() {
  try {
    const res = await axios.get(`/question-sets/exam/${selectedExamId.value}`)
    questionSets.value = Array.isArray(res) ? res : res.data || []
  } catch (err) {
    questionSets.value = []
    toast.error('❌ Lỗi tải bộ đề: ' + err.message)
  }
}

function onFileChange(e) {
  files.value = Array.from(e.target.files)
}

async function uploadFiles() {
  if (!selectedExamId.value || files.value.length === 0) {
    toast.warning('⚠️ Chưa chọn kỳ thi hoặc file.')
    return
  }
  const formData = new FormData()
  files.value.forEach(file => formData.append('files', file))
  try {
    const res = await axios.post(`/questions/import/upload-multi/${selectedExamId.value}`, formData)
    toast.success('✅ Đã upload: ' + res.data)
    await loadQuestionSets()
  } catch (err) {
    toast.error('❌ Upload thất bại: ' + err.message)
  }
}

function stripExtension(name) {
  return name.replace(/\.[^/.]+$/, '')
}

function formatDate(dt) {
  if (!dt) return ''
  return dt.split('.')[0].replace('T', ' ')
}

function formatFullDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isPreviewing(id) {
  return previewSetId.value === id
}

async function togglePreview(set) {
  if (previewSetId.value === set.id) {
    previewSetId.value = null
    previewContent.value = []
  } else {
    try {
      const res = await axios.get(`/question-sets/${set.id}/export-json`)
      // console.log(" DATA TỪ API /export-json:", res)

      if (!Array.isArray(res)) {
        toast.error("❌ Dữ liệu không hợp lệ.")
        return
      }

      previewContent.value = res
      previewTitle.value = stripExtension(set.name)
      previewSetId.value = set.id
    } catch (err) {
      toast.error("❌ Lỗi tải nội dung đề: " + err.message)
    }
  }
}


async function toggleEnabled(set) {
  const newValue = !set.enabled
  try {
    await axios.put(`/question-sets/${set.id}/enable`, null, { params: { enabled: newValue } })
    set.enabled = newValue
    toast.success("✅ Đã cập nhật trạng thái đề thi.")
  } catch (err) {
    toast.error("❌ Lỗi cập nhật trạng thái: " + err.message)
  }
}

async function deleteSet(id) {
  if (!confirm("Xoá bộ đề này?")) return
  await axios.delete(`/question-sets/${id}`)
  await loadQuestionSets()
  toast.success("🗑️ Đã xoá bộ đề.")
}

async function deleteExam(id) {
  if (!confirm("Xoá kỳ thi này?")) return
  await axios.delete(`/exams/${id}`)
  exams.value = exams.value.filter((e) => e.id !== id)
  toast.success("🗑️ Đã xoá.")
}

function cancelEdit() {
  editExam.value = null
  form.value = { name: '', description: '', startTime: '', endTime: '' }
}

async function submitExam() {
  try {
    const data = { ...form.value }
    const res = editExam.value
      ? await axios.put(`/exams/${editExam.value.id}`, data)
      : await axios.post('/exams', { ...data, questionCount: 0 })

    if (editExam.value) {
      const idx = exams.value.findIndex((e) => e.id === editExam.value.id)
      exams.value[idx] = res.data
      toast.success('✅ Cập nhật thành công')
    } else {
      exams.value.push(res.data)
      toast.success('✅ Tạo thành công')
    }
    cancelEdit()
  } catch (err) {
    toast.error('❌ Lỗi: ' + err.message)
  }
}
</script>


<style scoped>

.exam-manager {
  width: 100%;
  max-width: 1300px;
  margin: 40px auto;
  padding: 24px;
  font-family: 'Segoe UI', sans-serif;
  background: #f4f6fa;
  border-radius: 6px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.04);
   max-height: calc(100vh - 100px); 
  overflow-y: auto;     
}

.view-switch {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
  gap: 5px;
}

.switch-btn {
  background: #f1f1f1;
  padding: 7px 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: all 0.2s ease;
  cursor: pointer;
}

.switch-btn:hover {
  background-color: #e0e0e0;
}

.switch-btn.active {
  background-color: #1976d2;
  color: #fff;
  border-color: #1976d2;
}

.form-section,
.list-section,
.question-sets {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.blue-bg {
  background-color: #e3f6ff;
}

.purple-bg {
  background-color: #ece8f9;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 84%;
  margin-bottom: 21px;
}

.form-row label {
  width: 160px;
  text-align: right;
  font-weight: 600;
  color: #444;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 11px 14px;
  border-radius: 6px;
  font-size: 15px;
  border: 1px solid #ccc;
  background: #fff;
}

.form-actions {
  text-align: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #caf582;
  color: rgb(0, 0, 0);
  margin-left: 8px;
  padding: 6px 12px;
}

.btn-secondary {
  background-color: #d0dd17;
  color: rgb(18, 15, 15);
}

.btn-success {
  background-color: #2e7d32;
  color: white;
  margin-left: 10px;
}

.btn-edit {
  background-color: #0288d1;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 6px;
}

.btn-delete {
  background-color: #e53935;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}

.table th {
  background: #f0f0f0;
  font-weight: 600;
}

.question-sets ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.question-sets li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f1f6ff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.question-set-title {
  font-size: 18px;
  font-weight: bold;
  color: #0d3c61;
  margin-bottom: 12px;
}
.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f1f6ff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.set-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.set-name {
  display: flex;
  flex-direction: column;
}

.set-title {
  font-weight: bold;
  font-size: 16px;
}

.set-used-at {
  font-size: 12px;
  color: #666;
}
.set-used-badge {
  font-size: 12px;
  color: #e91e63;
  font-weight: 600;
  margin-left: 8px;
}
.set-name-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.set-used-badge {
  font-size: 13px;
  color: #e91e63;
  font-weight: 500;
}

.set-used-at {
  font-size: 13px;
  color: #666;
}
.preview-box {
  background: #fff;
  border: 1px solid #ccc;
  padding: 24px;
  border-radius: 12px;
  margin-top: 20px;
  max-height: 400px;
  overflow: auto;
}

</style>

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
        <h3 class="form-title">Danh sách môn thi</h3>
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
          <!-- Upload -->
          <div class="form-row vertical-upload">
            <div class="form-row">
              <label>File đề thi (Excel):</label>
              <input type="file" multiple @change="onFileChange" class="file-input" />
            </div>
            <div class="form-row upload-button-row">
              <button class="btn btn-success" @click="uploadFiles">Upload</button>
            </div>
          </div>

          <!-- Danh sách bộ đề -->
         <section class="question-sets">
        <h3 class="question-set-title">Các bộ đề trong môn thi:</h3>
        <ul v-if="questionSets.length > 0">
          <li v-for="set in questionSets" :key="set.id" class="set-row">
            <div class="set-info">
              <input type="checkbox" :checked="set.enabled" @change="toggleEnabled(set)" />
              <span class="set-title">{{ stripExtension(set.name) }}</span>
              <span v-if="set.lastUsedAt" class="set-used-at">
                Đã sử dụng :  {{ formatFullDate(set.lastUsedAt) }}
              </span>
            </div>
            <div class="set-actions">
              <button class="btn-delete" @click="deleteSet(set.id)">🗑️ Xoá</button>
              <button
                class="btn"
                :class="isPreviewing(set.id) ? 'btn-secondary' : 'btn-primary'"
                @click="togglePreview(set)"
              >
                {{ isPreviewing(set.id) ? 'Ẩn' : 'Xem' }}
              </button>
              <button class="btn btn-secondary" @click="goToEditSet(set.id)"> Cập nhật</button>
            </div>
          </li>
        </ul>
        <p v-else class="no-set-msg">Không có bộ đề nào trong môn thi này.</p>
      </section>
          <!-- Xem trước nội dung -->
          <div v-if="Array.isArray(previewContent) && previewContent.length > 0 && previewSetId" class="preview-box">
            <h4 class="preview-title">Nội dung đề: {{ previewTitle }}</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Nội dung câu hỏi</th>
                  <th>Các đáp án</th>
                  <th style="text-align: center;">Điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(q, index) in previewContent" :key="index">
                  <td style="text-align: center;">{{ index + 1 }}</td>
                  <td>{{ q.content }}</td>
                  <td>
                    <div v-for="(a, i) in q.answers || []" :key="i" class="answer-block">
                      <span :style="{ fontWeight: a.correct ? 'bold' : 'normal', color: a.correct ? 'green' : 'inherit' }">
                        {{ String.fromCharCode(65 + i) }}. {{ a.content }}
                      </span>
                    </div>
                  </td>
                  <td style="text-align: center;">{{ (q.score ?? 0).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mở trang chỉnh sửa khi editingSet có dữ liệu -->
          <div v-if="editingSet" class="edit-box">
            <h3> Chỉnh sửa nội dung đề: {{ editingSet.title }}</h3>
            <div class="form-row">
              <label>Thời gian thi (phút):</label>
              <input type="number" min="1" v-model.number="editingSet.duration" />
            </div>
            <div class="form-row">
              <button class="btn btn-success" @click="saveEditedSet"> Lưu lại</button>
              <button class="btn btn-secondary" @click="editingSet = null">Hủy</button>
            </div>
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
import * as XLSX from 'xlsx'
import { useRouter } from 'vue-router';


const router = useRouter();
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
    toast.error(" Lỗi tải danh sách kỳ thi: " + err.message)
  }
}

async function loadQuestionSets() {
  try {
    const res = await axios.get(`/question-sets/exam/${selectedExamId.value}`)
    questionSets.value = Array.isArray(res) ? res : res.data || []
  } catch (err) {
    questionSets.value = []
    toast.error(' Lỗi tải bộ đề: ' + err.message)
  }
}

function onFileChange(e) {
  files.value = Array.from(e.target.files)
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
        toast.error(" Dữ liệu không hợp lệ.")
        return
      }

      previewContent.value = res
      previewTitle.value = stripExtension(set.name)
      previewSetId.value = set.id
    } catch (err) {
      toast.error(" Lỗi tải nội dung đề: " + err.message)
    }
  }
}


async function toggleEnabled(set) {
  const newValue = !set.enabled
  try {
    await axios.put(`/question-sets/${set.id}/enable`, null, { params: { enabled: newValue } })
    set.enabled = newValue
    toast.success(" Đã cập nhật trạng thái đề thi.")
  } catch (err) {
    toast.error(" Lỗi cập nhật trạng thái: " + err.message)
  }
}

async function deleteSet(id) {
  if (!confirm("Xoá bộ đề này?")) return
  await axios.delete(`/question-sets/${id}`)
  await loadQuestionSets()
  toast.success(" Đã xoá bộ đề.")
}

async function deleteExam(id) {
  if (!confirm("Xoá kỳ thi này?")) return
  await axios.delete(`/exams/${id}`)
  exams.value = exams.value.filter((e) => e.id !== id)
  toast.success(" Đã xoá.")
}

function cancelEdit() {
  editExam.value = null
  form.value = { name: '', description: '', startTime: '', endTime: '' }
}

async function submitExam() {
  //  Kiểm tra các trường bắt buộc
  if (!form.value.name.trim() || !form.value.description.trim() ||
      !form.value.startTime || !form.value.endTime) {
    toast.warning(" Vui lòng nhập đầy đủ thông tin trước khi tạo!");
    return;
  }

  //  Kiểm tra thời gian hợp lệ
  if (new Date(form.value.startTime) >= new Date(form.value.endTime)) {
    toast.warning(" Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!");
    return;
  }

  try {
    const data = { ...form.value };
    const res = editExam.value
      ? await axios.put(`/exams/${editExam.value.id}`, data)
      : await axios.post('/exams', { ...data, questionCount: 0 });

    if (editExam.value) {
      const idx = exams.value.findIndex((e) => e.id === editExam.value.id);
      exams.value[idx] = res.data;
      toast.success(" Cập nhật thành công");
    } else {
      exams.value.push(res.data);
      toast.success(" Tạo thành công");
    }
    cancelEdit();
  } catch (err) {
    toast.error(" Lỗi: " + err.message);
  }
}

async function updateSetDuration(set) {
  try {
    await axios.put(`/question-sets/${set.id}/duration`, {
      duration: set.duration || 45,
    });
    toast.success(" Cập nhật thời gian thành công");
  } catch (err) {
    toast.error(" Cập nhật thời gian thất bại: " + err.message);
  }
}
async function confirmUpdateDuration(set) {
  if (!confirm("Bạn có chắc muốn cập nhật thời gian thi?")) return;
  await updateSetDuration(set);
}
async function readExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const questions = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    questions.push({
      content: row[0],
      multipleChoice: true,
      score: parseFloat(row[1]) || 1,
      answers: [
        { content: row[2], correct: row[6] === 'TRUE' },
        { content: row[3], correct: row[7] === 'TRUE' },
        { content: row[4], correct: row[8] === 'TRUE' },
        { content: row[5], correct: row[9] === 'TRUE' },
      ]
    });
  }
  return questions;
}
async function uploadFiles() {
  if (!selectedExamId.value || files.value.length === 0) {
    toast.warning(' Chưa chọn kỳ thi hoặc file.')
    return
  }
  const formData = new FormData()
  files.value.forEach(file => formData.append('files', file))
  try {
    const res = await axios.post(`/questions/import/upload-multi/${selectedExamId.value}`, formData)
    if (typeof res === 'string' && res.includes('trùng tên')) {
      toast.warning(' Đề đã bị bỏ qua vì trùng tên.')
    } else {
      toast.success(' Đã upload: ' + res)
    }
    await loadQuestionSets()
  } catch (err) {
    toast.error(' Upload thất bại: ' + err.message)
  }
}
const editingSet = ref(null)

async function editQuestionSet(set) {
  try {
    const res = await axios.get(`/question-sets/${set.id}/export-json`)
    if (!Array.isArray(res)) {
      toast.error("Dữ liệu không hợp lệ")
      return
    }
    editingSet.value = {
      id: set.id,
      title: stripExtension(set.name),
      duration: set.duration,
      questions: res
    }
  } catch (err) {
    toast.error(" Lỗi tải nội dung đề: " + err.message)
  }
}

async function saveEditedSet() {
  try {
    await axios.put(`/question-sets/${editingSet.value.id}/update-questions`, editingSet.value.questions)
    await axios.put(`/question-sets/${editingSet.value.id}/duration`, {
      duration: editingSet.value.duration,
    })
    toast.success(" Đã lưu đề và thời gian!")
    editingSet.value = null
    await loadQuestionSets()
  } catch (err) {
    toast.error(" Lỗi khi lưu: " + err.message)
  }
}
function goToEditSet(setId) {
  router.push(`/edit-question-set/${setId}`)
}
function startEdit(exam) {
  editExam.value = exam;
  form.value = {
    name: exam.name || '',
    description: exam.description || '',
    startTime: formatDateForInput(exam.startTime),
    endTime: formatDateForInput(exam.endTime),
  };
}
function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


</script>


<style scoped src="./ExamManager.css">

</style>

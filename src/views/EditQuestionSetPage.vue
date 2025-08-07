<template>
  <div class="edit-set-page">
    <h2 class="title">Chỉnh sửa nội dung đề: {{ title }}</h2>

    <div class="edit-section inline-form-row">
      <label for="duration">Thời gian thi (phút):</label>
      <input
        id="duration"
        type="number"
        v-model.number="duration"
        min="1"
        class="duration-input"
      />
      <button class="btn-save" @click="updateDuration">Lưu thời gian</button>
    </div>

    <div class="edit-section">
      <h3>Câu hỏi và đáp án:</h3>

      <div class="table-wrapper">
        <table class="editable-table">
          <thead>
            <tr>
              <th style="width: 50px;">STT</th>
              <th style="width: 30%;">Nội dung câu hỏi</th>
              <th style="width: 55%;">Các đáp án</th>
              <th style="width: 80px;">Điểm</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(q, index) in questions" :key="index">
              <td style="text-align: center;">{{ index + 1 }}</td>
              <td>
                <textarea v-model="q.content" class="question-input" />
              </td>
              <td>
                <div v-for="(a, i) in q.answers" :key="i" class="answer-row">
                  <input type="text" v-model="a.content" class="answer-input" />
                  <label><input type="checkbox" v-model="a.correct" /> Đúng</label>
                </div>
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="q.score"
                  class="score-input"
                  min="0"
                  step="0.1"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="action-buttons">
        <button class="btn btn-save" @click="saveQuestions">Lưu nội dung đề</button>
        <button class="btn btn-back" @click="router.push('/exam-manager')"> Thoát</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import axios from '../services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const setId = route.params.id
const title = ref('')
const duration = ref(45)
const originalDuration = ref(45)
const questions = ref([])
const originalQuestions = ref([])
const examId = ref(null) 
const isDirtyDuration = ref(false)
const isDirtyQuestions = ref(false)

onMounted(fetchSetData)
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Lấy dữ liệu ban đầu
async function fetchSetData() {
  try {
    const meta = await axios.get(`/question-sets/${setId}`)
    duration.value = meta.duration
    originalDuration.value = meta.duration
 title.value = meta.name.replace(/\.xlsx$/, '')
    // title.value = meta.name
    examId.value = meta.examId 
    const res = await axios.get(`/question-sets/${setId}/export-json`)
    questions.value = res
    originalQuestions.value = JSON.parse(JSON.stringify(res))
  } catch (err) {
    toast.error('Lỗi tải dữ liệu: ' + err.message)
  }
}

// Theo dõi thay đổi
watch(duration, (newVal) => {
  isDirtyDuration.value = newVal !== originalDuration.value
})

watch(
  questions,
  () => {
    isDirtyQuestions.value =
      JSON.stringify(questions.value) !== JSON.stringify(originalQuestions.value)
  },
  { deep: true }
)

// Ngăn đóng tab nếu chưa lưu
function handleBeforeUnload(e) {
  if (isDirtyDuration.value || isDirtyQuestions.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Ngăn điều hướng router nếu chưa lưu
onBeforeRouteLeave(async (to, from, next) => {
  if (!isDirtyDuration.value && !isDirtyQuestions.value) return next()

  const confirmMsg = [
    isDirtyDuration.value ? '• thời gian thi' : '',
    isDirtyQuestions.value ? '• nội dung câu hỏi/đáp án' : '',
  ]
    .filter(Boolean)
    .join('\n')

  const confirmSave = window.confirm(
    `⚠️ Bạn có thay đổi chưa lưu:\n${confirmMsg}\n\nBạn có muốn lưu trước khi rời trang?`
  )

  if (confirmSave) {
    try {
      if (isDirtyDuration.value) await updateDuration()
      if (isDirtyQuestions.value) await saveQuestions()
      next()
    } catch (err) {
      toast.error('❌ Có lỗi khi lưu. Không thể rời trang.')
      next(false)
    }
  } else {
    next()
  }
})

// Cập nhật thời gian
async function updateDuration() {
const confirmSave = window.confirm("Bạn có chắc muốn lưu thời gian thi?")
  if (!confirmSave) return;

  await axios.put(`/question-sets/${setId}/duration`, { duration: duration.value })
  originalDuration.value = duration.value
  isDirtyDuration.value = false
  toast.success(' Đã lưu thời gian thi')
}

//  Cập nhật nội dung câu hỏi (thêm examId vào từng câu)
async function saveQuestions() {
    const confirmSave = window.confirm("Bạn có chắc muốn lưu thay đổi nội dung đề?")
        if (!confirmSave) return;

  const updated = questions.value.map((q) => ({
    ...q,
    examId: examId.value,
    questionSetId: setId,
  }))
  await axios.put(`/question-sets/${setId}/update-questions`, updated)
  originalQuestions.value = JSON.parse(JSON.stringify(updated))
  isDirtyQuestions.value = false
  toast.success(' Đã lưu nội dung đề')
}
</script>

<style scoped src="./EditQuestionSetPage.css"></style>
